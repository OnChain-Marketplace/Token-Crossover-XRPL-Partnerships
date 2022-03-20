# Token-Crossover-XRPL-
This program is useful for any project looking to partner with another on the XRPL. Partnering with projects is a big step, and can influence your porject's reputation and community, either positively or negatively.

This simple tool was designed to give projects the ability to analyse how many of their holders/supporters already support the project/s that you may be partnering with. It reports these statistics to help you make a more informed decision, and also saves the accounts that do cross-over in a JSON array for future referral.

# Use-Case
The XRPL is famous for the amount of partnerships between various XRPL Token projects, while this is mostly beneficial, sometimes it occurs at the detriment of the community. This tool allows projects to make more informed decisions on forming partnerships, based on their current communit's statistics.

# Variables 
The user can define numerous variables within the config file.
1) nodes: An array of websockets for Rippled nodes (the function will cycle through the array if necessary)
4) retrymax: Max attempts repeat a process if an error was found (number)
5) tokens: Array of the details for all the XRPL tokens involved
6) name: The name of the token (for logging purposes)
7) hex: Hexcode for the token (As defined by the XRPL/Rippled)
8) issuer: Issuing address of the token (XRPL)

# Operation
The program can be run simply on any JS module.

# Flow
1) Snapshots of the trusltines are taken for each token
2) These snapshots are sorted into Holders, and All Trustline groups
3) These stats are then compared to find the total amount of accounts that cross-over
4) Any accounts that do cross over are then saved as a JSON array for future referral

# Error Handling
All attempts will be made x times (defined in config file), in the event an attempt fails everytime, the program will close and create and log the error within an ERRORs.txt. The user can then resolve any issues as needed.

# Dependancies
xrpl -> https://github.com/XRPLF/xrpl.js

# Extra
Built using JS, OnChain Whales

