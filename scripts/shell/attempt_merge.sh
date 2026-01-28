
#!/bin/bash
echo "Starting merge attempt..." > merge_debug.log
git fetch origin main >> merge_debug.log 2>&1
git merge origin/main >> merge_debug.log 2>&1
echo "Merge status code: $?" >> merge_debug.log
