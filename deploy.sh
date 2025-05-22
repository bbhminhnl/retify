#!/bin/bash

# Lấy thông tin user name và email hiện tại của git
current_user=$(git config user.name)
current_email=$(git config user.email)

# Khai báo user name và email trung gian có quyền deploy vercel
new_user="minhnl"
new_email="minhnl@botbanhang.vn"

# Thay đổi thông tin user name và email hiện tại thành user trung gian
git config user.name "$new_user"
git config user.email "$new_email"

# Commit và push code lên github bằng user trung gian
git add .
git commit --allow-empty -m "Deploy vercel bởi $current_user thông qua $new_user"

# Kiểm tra nếu upstream branch đã được thiết lập
if ! git rev-parse --abbrev-ref --symbolic-full-name @{u} &> /dev/null; then
    # Push code lần đầu tiên và thiết lập upstream branch
    git push --set-upstream origin "$(git rev-parse --abbrev-ref HEAD)"
else
    # Push code từ lần thứ hai trở đi
    git push
fi

# Thay đổi lại thông tin user name và email gốc
git config user.name "$current_user"
git config user.email "$current_email"
