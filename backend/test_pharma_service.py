import unittest

import pharma_service


class PharmaServiceRxNormParserTests(unittest.TestCase):
    def test_search_rxnorm_drugs_handles_single_dict_concept_group(self):
        sample = {
            "drugGroup": {
                "conceptGroup": {
                    "tty": "SBD",
                    "conceptProperties": {
                        "rxcui": "596928",
                        "name": "duloxetine 20 MG Delayed Release Oral Capsule [Cymbalta]",
                        "synonym": "Cymbalta 20 MG Delayed Release Oral Capsule",
                        "tty": "SBD",
                    },
                }
            }
        }

        pharma_service._fetch_json = lambda url, timeout=6: sample if "drugs.json" in url else None

        results = pharma_service.search_rxnorm_drugs("duloxetine")

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["rxcui"], "596928")
        self.assertEqual(results[0]["name"], "duloxetine 20 MG Delayed Release Oral Capsule [Cymbalta]")
        self.assertEqual(results[0]["source"], "RxNorm")

    def test_get_rxnorm_properties_handles_single_dict_prop_concept(self):
        sample = {
            "propConceptGroup": {
                "propConcept": {
                    "propName": "NAME",
                    "propValue": "duloxetine",
                }
            }
        }

        pharma_service._fetch_json = lambda url, timeout=6: sample if "allProperties" in url else None

        properties = pharma_service.get_rxnorm_properties("596928")

        self.assertEqual(properties["NAME"], "duloxetine")


if __name__ == "__main__":
    unittest.main()
