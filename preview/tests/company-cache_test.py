import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('company_cache', Path(__file__).parents[1] / 'lib/company-cache.py')
cache = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cache)


class CacheChecks(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='ccs-company-cache-test-')
        self.root = Path(self.temp.name)
        self.db = cache.connect(self.root/'companies.db', 'agency-acquisition/test')
        self.rules = self.root/'fit-rules.md'
        self.rules.write_text('Industrial maintenance. Unknown customer value stays unknown.')
        self.contacts = self.root/'contacts.csv'
        self.contacts.write_text('email,domain,title\na@one.example,https://www.one.example/about,Owner\nb@one.example,one.example,CEO\nc@two.example,two.example,Director\nd@gmail.com,gmail.com,Owner\n')

    def tearDown(self):
        self.db.close()
        self.temp.cleanup()

    def websites(self, text='Industrial maintenance services for manufacturers. '*10):
        file = self.root/'websites.csv'
        if file.exists():
            file.unlink()
        cache.write_csv(file, [{'domain':'one.example', 'website_status':'OK', 'website_content':text, 'source_url':'https://one.example/'}], ['domain','website_status','website_content','source_url'])
        cache.import_websites(self.db, file)

    def test_dedup_cache_reuse_and_no_overwrite(self):
        first = cache.prepare(self.db,self.contacts,self.root/'first.csv')
        self.assertEqual((first['contacts'],first['unique_domains'],first['queued'],first['held_missing_or_free_domain']),(4,2,2,1))
        self.websites()
        second = cache.prepare(self.db,self.contacts,self.root/'second.csv')
        self.assertEqual((second['cached'],second['queued']),(1,1))
        with self.assertRaises(FileExistsError):
            cache.prepare(self.db,self.contacts,self.root/'second.csv')

    def test_wrong_context_stops_and_resume_reads_sqlite(self):
        self.websites()
        with self.assertRaisesRegex(ValueError,'Wrong campaign context'):
            cache.connect(self.root/'companies.db','client-delivery/another')
        reopened = cache.connect(self.root/'companies.db','agency-acquisition/test')
        self.assertEqual(reopened.execute('SELECT count(*) FROM companies').fetchone()[0],1)
        reopened.close()

    def test_model_handoff_hashes_and_contact_join(self):
        self.websites()
        queue = self.root/'analysis.json'
        cache.analysis_queue(self.db,queue,self.rules)
        batch = json.loads(queue.read_text())
        row = batch['companies'][0]
        result = [{**row,'rules_hash':batch['rules_hash'],'profile':'Industrial maintenance supplier','score':'GOOD','reason':'Website describes the agreed service.'}]
        answer = self.root/'answers.json'
        answer.write_text(json.dumps(result))
        self.assertFalse(cache.import_analysis(self.db,answer,self.rules)['approved_to_email'])
        output = self.root/'contacts-researched.csv'
        cache.join(self.db,self.contacts,output,self.rules)
        rows,_ = cache.read_csv(output)
        self.assertEqual(len(rows),4)
        self.assertEqual(rows[0]['company_profile'],rows[1]['company_profile'])
        self.assertEqual(rows[0]['research_status'],'PROPOSED_RESEARCH_ONLY')
        self.assertEqual(rows[2]['research_status'],'HOLD_MISSING_OR_STALE_ANALYSIS')

    def test_changed_website_or_rules_invalidates_analysis(self):
        self.websites()
        queue = self.root/'analysis.json'
        cache.analysis_queue(self.db,queue,self.rules)
        batch = json.loads(queue.read_text())
        row = {**batch['companies'][0],'rules_hash':batch['rules_hash'],'profile':'Supplier','score':'GOOD','reason':'Website evidence'}
        answer=self.root/'answer.json'
        answer.write_text(json.dumps([row]))
        cache.import_analysis(self.db,answer,self.rules)
        self.websites('Changed industrial maintenance evidence. '*10)
        self.assertIsNone(self.db.execute('SELECT analysis FROM companies').fetchone()[0])
        with self.assertRaisesRegex(ValueError,'Stale website'):
            cache.import_analysis(self.db,answer,self.rules)
        self.rules.write_text('A changed buyer definition')
        with self.assertRaisesRegex(ValueError,'changed fit rules'):
            cache.import_analysis(self.db,answer,self.rules)

    def test_unknown_or_unmatched_evidence_is_not_imported(self):
        bad=self.root/'bad.csv'
        cache.write_csv(bad,[{'domain':'one.example','website_status':'GOOD','website_content':'invented','source_url':'https://elsewhere.example/'}],['domain','website_status','website_content','source_url'])
        with self.assertRaises(ValueError):
            cache.import_websites(self.db,bad)
        self.assertEqual(self.db.execute('SELECT count(*) FROM companies').fetchone()[0],0)


if __name__ == '__main__':
    unittest.main()
