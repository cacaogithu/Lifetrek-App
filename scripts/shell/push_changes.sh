
#!/bin/bash
echo "Starting push script..." > push_debug.log
git checkout -b feature/marketing-fixes-final-v4 >> push_debug.log 2>&1
git add . >> push_debug.log 2>&1
git commit -m "feat: Marketing fixes (Dashboard, Content, Docs)" >> push_debug.log 2>&1
git push -u origin feature/marketing-fixes-final-v4 >> push_debug.log 2>&1
echo "Script finished." >> push_debug.log
