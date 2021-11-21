cd electionguard-python
poetry run python -m pytest -s tests/testVectorGenerate.py -k test_vector_generate
cd ../
cp -r generated_test_inputs/. ElectionGuard-COMP413/generated_test_inputs_ts
cd ElectionGuard-COMP413
yarn test src/serialization.test.ts -t testTestVectors
