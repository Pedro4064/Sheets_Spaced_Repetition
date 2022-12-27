# Overview

## Structure

Each column is the day that we did the revision and the last column is the day of the next review -> Which is exactly what we need to calculate based on the state and the previous score.

1. ~~Get all subjects sheets -> exclude the overview and configuration sheet~~

2. ~~Parse each entry (i.e each line)~~

3. Create the Finite State Machine to determine the next revision date

4. Update the next revision

5. Populate the overview block (take into account overdue ones as well, not only future ones)

6. Populate the "pivot table" on the overview sheet
