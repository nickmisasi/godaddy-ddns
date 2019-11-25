# Godaddy DDNS

This is a script written to update subdomains in godaddy to point to my public IP address, which isn't static. The script will check what's set in godaddy against what the current public IP is. It will then update godaddy's DNS records to point to the proper public IP if there is a discrepancy. 


### Setup

It is recommended to run this via cron, or Windows Task Scheduler.

Place a file, `.env` in the root of this project's folder. It should have the following values:
```
KEY=<key from godaddy developer API>
SECRET=<secret from godaddy developer API>
CUSTOMER_ID=<Customer #, you can find this in the menu where you log out>
DOMAIN_NAME=<the fully qualified domain name, WITHOUT sub domain>
SUB_DOMAIN_NAME=<the sub domain you want to update>
TARGET_PORT=<OPTIONAL, the target port to append onto the public IP.
```

Run:
```
npm install
node index.js
```
