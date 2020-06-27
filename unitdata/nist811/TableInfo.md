The following tables in CSV format are an abbreviated version of the NIST 
["Special Publication 811: NIST Guide to the SI" Appendix B.9](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9). 
They are converted to a more easily machine readable format and are used for 
verifying conversion accuracy of units in the db.json file.

They have the following basic format:

| Convert From | Convert To | Multipy By | Included in PQM |
| ------------ | ---------- | ---------- | --------------- |
| ft / s       | m / s      | 3.048e-01  | true            |

Which means that (1 ft / s) approximately equals (3.048e-01 m / s). The last 
row indicates if all parts of the unit are supported by PQM, as they might or
might not be useful to include / exclude in the future. Non obvious or 
confusing units may have a full name included in parenthesis to avoid
confusion. For example:

| Convert From  | Convert To | Multipy By | Included in PQM |
| ------------- | ---------- | ---------- | --------------- |
| Gal (Galileo) | \[c\]m / s^2 | 1.0        | false           |

It is assumed that most people would easily confuse this unit with the more
common "Gallon". So special notation is helpful.

