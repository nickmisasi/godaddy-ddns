const fetch = require('node-fetch');
const dotenv = require('dotenv').config();
const url = require('url');
const KEY = process.env.KEY;
const SECRET = process.env.SECRET;


const requestHeaders = {
    Authorization: `sso-key ${KEY}:${SECRET}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};


async function getCurrentIp() {
    const result = await fetch('http://ipinfo.io/json');
    const ipInfo = await result.json();
    return ipInfo.ip;
}

async function run() {
    try {
        const shopperUrl = `https://api.godaddy.com/v1/shoppers/${process.env.CUSTOMER_ID}?includes=customerId`
        // We need to get the customer identifier to make subsequent calls
        let result = await fetch(shopperUrl, {
            method: 'get',
            headers: requestHeaders,
        });
        let shopper = await result.json();
        const customerId = shopper.customerId;

        const subdomainUrl = `https://api.godaddy.com/v2/customers/${customerId}/domains/forwards/${process.env.DOMAIN_NAME}?includeSubs=true`
        result = await fetch(subdomainUrl, {
            method: 'get',
            headers: requestHeaders,
        });
        const subDomains = await result.json();
        // Find the sub domain we want to edit
        const subDomain = subDomains.find(obj => {
            return obj.fqdn === process.env.SUB_DOMAIN_NAME;
        })

        // parse the URL from the domain
        const remoteIp = new URL(subDomain.url);
        const currentIp = await getCurrentIp();

        // If what's in godaddy doesn't match our current public IP, we need to update godaddy.
        if (remoteIp.hostname !== currentIp) {
            // Allow a TARGET_PORT variable from env, in case something isn't hosted on port 80/443.
            const newSubDomainRule = {
                type: "REDIRECT_PERMANENT",
                url: process.env.TARGET_PORT ? `http://${currentIp}:${process.env.TARGET_PORT}` : `http://${currentIp}`
            };
            const result = await fetch(`https://api.godaddy.com/v2/customers/${customerId}/domains/forwards/${process.env.SUB_DOMAIN_NAME}`, {
                method: 'put',
                body: JSON.stringify(newSubDomainRule),
                headers: requestHeaders,
            });

            // godaddy returns 204 on success
            if (result.status !== 204) {
                throw Error("Got wrong response code from godaddy during subdomain update");
            }
        } else {
            console.log('IP\'s match. Exiting...');
        }
    } catch (err) {
        console.log(err);
    }    
}

run()