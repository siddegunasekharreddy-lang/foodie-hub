# Publish Foodie-Hub to GitHub

The source code is ready to push. First create an empty repository in your GitHub account:

1. Sign in at https://github.com/new
2. Repository name: `foodie-hub`
3. Choose Public or Private according to your college submission requirement.
4. Do not add a README, `.gitignore` or licence from GitHub; this ZIP already contains project files.
5. Create the repository and copy its HTTPS URL.

Then open the extracted `foodie-hub` folder in Visual Studio Code, open **Terminal → New Terminal**, and run the following commands. Replace `YOUR-USERNAME` with your GitHub username if you use the example remote URL.

```bash
git init
git add .
git commit -m "Initial commit: Foodie-Hub food ordering system"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/foodie-hub.git
git push -u origin main
```

If Git asks you to authenticate, complete the sign-in prompt in your browser or Visual Studio Code. Do not paste your password or personal access token into project files or share it in chat.

After a successful push, your project link will be:

```text
https://github.com/YOUR-USERNAME/foodie-hub
```
