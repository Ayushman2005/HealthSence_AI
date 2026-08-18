import unittest

import pharma_service


class PharmaServiceRxNormParserTests(unittest.TestCase):
    def test_search_rxnorm_drugs_uses_local_registry_without_rxnav_or_rxcui(self):
        pharma_service._fetch_json = lambda url, timeout=6: None

        results = pharma_service.search_rxnorm_drugs("metformin")

        self.assertEqual(len(results), 1)
        self.assertNotIn("rxcui", results[0])
        self.assertEqual(results[0]["name"], "Metformin Hydrochloride")
        self.assertEqual(results[0]["source"], "Local Clinical Registry")

    def test_get_rxnorm_properties_returns_local_registry_data(self):
        properties = pharma_service.get_rxnorm_properties("metformin")

        self.assertEqual(properties["NAME"], "Metformin Hydrochloride")
        self.assertIn("Biguanide", properties["CLASS"])

    def test_check_rxnorm_drug_interactions_uses_local_rules(self):
        interactions = pharma_service.check_rxnorm_drug_interactions(["lisinopril", "losartan"])

        self.assertTrue(interactions)
        self.assertEqual(interactions[0]["severity_level"], "high")
        self.assertEqual(interactions[0]["source"], "Local Clinical Guideline Reference")


if __name__ == "__main__":
    unittest.main()
