cd electionguard-python
poetry run python3 -m pytest -s tests/dataGenerate.py -k test_generators_yield_valid_output
cd ../
cp -r generated_data ElectionGuard-COMP413
cd ElectionGuard-COMP413
yarn test src/serialization.test.ts -t testConvertJsonFileToObj
cd ../
cp -r ElectionGuard-COMP413/encrypted_data .
cd electionguard-python
poetry run python tests/jsondecrypt.py
