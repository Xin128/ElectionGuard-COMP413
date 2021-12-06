for file in encrypted_data/000/*.txt; 
    do mv "$file" "${file%.txt}.json";
done
rm encrypted_data/000/.DS_Store
cd electionguard-python
poetry run python tests/tally_ballots.py
cd ../
cp generated_tally_res/tally_output.json ElectionGuard-COMP413/demo/frontend/tally_output.json
cd ElectionGuard-COMP413/demo/frontend
surge