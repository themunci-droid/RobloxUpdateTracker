# Roblox Update Tracker

Notifies you of Roblox updates, I made this quick little script in about 30 minutes for my Roblox Offsets server (https://discord.gg/5bAtkh6uJb).
If you don't want to run this yourself, you can join my Discord and get the update notification roles.

Update the webhook URL in `index.js`, make sure to read the comment written under it as that is important. This is designed to be ran as a background process (ideally on a server).
You can modify the embed content and mentions as you wish, this project is designed to be ran if you have basic knowledge of programming to edit the code.

Required dependencies:
- `@replit/node-fetch`
- `fs`
- `path`

This is a Node.js application.
