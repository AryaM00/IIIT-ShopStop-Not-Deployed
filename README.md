# IIIT ShopStop

## How to Run

### Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
2. Install dependencies
    ```bash
    npm install
3. Start the app
    ```bash
    npm run dev
#
### Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
2. Install dependencies
    ```bash
    npm install
3. Start the app
    ```bash
    npm run dev
#
## Common Error: Port 5000 Already in Use

When running the server, you might encounter the following error:

```bash
Error: listen EADDRINUSE: address already in use :::5000
    at Server.setupListenHandle [as _listen2] (node:net:1937:16)
    at listenInCluster (node:net:1994:12)
    at Server.listen (node:net:2099:7)
Emitted 'error' event on Server instance:
code: 'EADDRINUSE',
errno: -98,
syscall: 'listen',
address: '::',
port: 5000
```

## Solution
1. Find the Process Using Port 5000:
```bash
sudo lsof -i :5000
```
2. Example output:
```bash
COMMAND    PID            USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    216274 mahendrakerarya   27u  IPv6 506333      0t0  TCP *:5000 (LISTEN)
```
3. Kill the process using the port
```bash
sudo kill -9 216274
```
4. Restart the server
```bash
npm run dev
```
#







