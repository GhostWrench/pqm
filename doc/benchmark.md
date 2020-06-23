Performance Benchmarking
================================================================================

Benchmark Computers
--------------------------------------------------------------------------------

| ID | Name         | CPU                                      | RAM      | Disk            |
| -- | ------------ | ---------------------------------------- | -------- | --------------- |
| 0  | Vostoro 7590 | Intel® Core™ i7-9750H CPU @ 2.60GHz × 12 | 15.4 GiB | 128 GB NVMe SSD |
| 1  |              |                                          |          |                 |

Benchmarks
--------------------------------------------------------------------------------

### Operations tested

#### Minified Size
Size of the module after minification with `terser` using the --compress and 
--mangle options

#### Note on Performance Measures
Performance measures should be taken with as many external progarms as possible
closed. Each is run 10 times and the minimum time is reported.

#### Load Time
Time that it takes to load the module using `require`

#### Conversion Time
Define a quantity in `\[k\]g m^2 / \[m\]s K` and convert to `BTU \[k\]s / K`

#### Math
With the already defined quantities:

`A = 10 kg`
`B = 5 cm`
`C = 10 s`

Do the operation

`(4*(A * B^2 / C^2) * 2*(A * B^2 / C^2)) - (3*(A * B^2 / C^2) * (A * B^2 / C^2))`

This performance test is also done with quantities that have an array of length
1000 filled with random values instead of scalar values.

`A = [? ... ?] kg`
`B = [? ... ?] kg`
`C = [? ... ?] kg`

#### To SI

Starting with the basic quantity `1 [k]g lbm in ft [m]m yd / s min` see how 
long the conversion to SI units takes. Bonus if the resulting unit is `J^2`

### Benchmarking results over each version

* Note: A value of `--` indicates no change in the benchmark

| PQM Version | Node Version |Computer ID | Minified Size | Minified + GZip | Load   | Conversion | Math {Array(1000)} | To SI  |
| ----------- | ------------ | ---------- | ------------- | --------------- | ------ | ---------- | ------------------ | ------ |
| 0.2.0       | 14.3.0       | 0          | 13.6 kB       |                 | 2.2 ms | 0.48 ms    | 0.13 ms            | 1.0 ms |
| 0.3.0       | 14.3.0       | 0          | 13.5 kB       |                 | --     | --         | --                 | --     |
| 0.3.1       | 14.3.0       | 0          | 14.1 kB       |                 | --     | 0.44 ms    | --                 | --     |
| 0.3.2       | 14.3.0       | 0          | 14.0 kB       |                 | --     | --         | --                 | --     |
| 0.4.0       | 14.3.0       | 0          | 14.8 kB       |                 | 1.8 ms | 0.50 ms    | --                 | --     |
| 0.4.1       | 14.3.0       | 0          | 14.8 kB       | 4.6 kB          | --     | --         | --                 | --     |
| o.4.4       | 14.3.0       | 0          | 22.3 kB       | 5.7 kB          | 1.9 ms | 0.60 ms    | 0.18 ms {4.4 ms}   | 1.1 ms |
