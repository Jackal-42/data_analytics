# config

1: navigate to the `data_analytics` directory (this directory)<br>
2: start a python local server (`python -m http.server`)<br>
3: start a second instance of command line and navigate to the `csv_reader` directory<br>
4: execute the `dm_lite` python file<br>
5: enter `COM3` for the first option and nothing for the second (if debugging)<br>
6: open a web browser and navigate to `localhost:8000` (or whatever port the python server is running on).<br>
7: select csv_reader from the directory listing<br>

# options
- -in `dm_lite.py`, change `debug` on line 10 to `False` to disable random data generation<br>
- the `sleep` function on line 104 of `dm_lite.py` governs delay between `.csv` updates<br>
- in `script.js`, `graphDuration` specifies the graph's extent in seconds and `updateFrequency` is how many times per second the `.csv` file updates.<br>
- on line 21 in `script.js`, the string in the `createGraph` function determines what the current graph represents. Add another `createGraph` function for multiple graphs.