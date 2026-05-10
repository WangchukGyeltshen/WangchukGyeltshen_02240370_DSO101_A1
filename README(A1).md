# DSO101 – Assignment 1
## Continuous Integration and Continuous Deployment

| | |
|---|---|
| **Student Name** | Wangchuk Gyeltshen |
| **Student Number** | 02240370 |
| **Course** | DSO101 |
| **GitHub Folder** | Wangchuk_02240370_DSO101_A1 |
| **Docker Hub** | wangchu21 |

---

# Part A: Deploying a Pre-Built Docker Image

This section documents the steps taken to build and push Docker images to Docker Hub, and deploy them on Render.com.

---

## Step 1: Writing the Dockerfiles

**Backend Dockerfile (`backend/Dockerfile`):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

**Frontend Dockerfile (`frontend/Dockerfile`):**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Step 2: Setting Up Environment Variables

A `.env` file was created for the backend with the following variables (not committed to Git):
- `MONGODB_URI` – MongoDB Atlas connection string
- `PORT=5000` – Server port

A `.env` file was created for the frontend:
- `NEXT_PUBLIC_API_URL=https://be-todo-02240370-1.onrender.com`

The `.env` file was added to `.gitignore` to ensure it was never committed to the repository.

---

## Step 3: Building and Pushing Images to Docker Hub

The backend image was built and pushed using the following commands:
```bash
cd backend
docker build -t wangchu21/be-todo:02240370 .
docker push wangchu21/be-todo:02240370
```

The frontend image was built with the API URL passed as a build argument:
```bash
cd frontend
docker build --build-arg NEXT_PUBLIC_API_URL=https://be-todo-02240370-1.onrender.com \
  -t wangchu21/fe-todo:02240370 .
docker push wangchu21/fe-todo:02240370
```

Both images were successfully pushed to Docker Hub:
🔗 https://hub.docker.com/u/wangchu21

### Screenshot: Docker Hub showing both images
![Docker Images](screenshots/2dockerImages.png)

---

## Step 4: Setting Up MongoDB Atlas

A free MongoDB Atlas cluster was created to serve as the database:
- Created a free M0 cluster on MongoDB Atlas
- Created a database user with read/write permissions
- Set Network Access to allow connections from anywhere (`0.0.0.0/0`) for Render compatibility
- Copied the connection string in the format:
```
mongodb+srv://username:password@cluster.xxxxx.mongodb.net/tododb
```

### Screenshot: MongoDB Atlas cluster dashboard
![Docker Images](screenshots/mongodbClustersDashboard.png)

---

## Step 5: Deploying Backend on Render

The backend was deployed on Render using the Docker Hub image:
- Navigated to Render.com → New → Web Service
- Selected "Deploy an existing image from a registry"
- Image: `wangchu21/be-todo:02240370`
- Service name: `be-todo-02240370-1`

The following environment variables were configured on Render:

| Key | Value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://... (Atlas connection string)` |
| `PORT` | `5000` |

Backend deployed successfully at:
🔗 https://be-todo-02240370-1.onrender.com

### Screenshot: Render backend service showing successful deployment
![Docker Images](screenshots/renderBE.png)

---

## Step 6: Deploying Frontend on Render

The frontend was deployed similarly:
- Navigated to Render.com → New → Web Service
- Selected "Deploy an existing image from a registry"
- Image: `wangchu21/fe-todo:02240370`
- Service name: `fe-todo-02240370`

Environment variable configured:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://be-todo-02240370-1.onrender.com` |

Frontend deployed successfully at:
🔗 https://fe-todo-02240370.onrender.com

### Screenshot: Render frontend service showing successful deployment
![Docker Images](screenshots/renderFE.png)

---

## Troubleshooting Encountered

During deployment, the following issues were encountered and resolved:

- **Wrong Dockerfile for Next.js** – The frontend was initially built using an nginx-based Dockerfile which is not compatible with Next.js. This was fixed by switching to a Node.js-based Dockerfile using `npm start`.

- **Wrong environment variable prefix** – The frontend variable was initially named `REACT_APP_API_URL`. Since the app uses Next.js, it was renamed to `NEXT_PUBLIC_API_URL` which is the correct prefix for client-side variables in Next.js.

- **Build-time environment variable** – `NEXT_PUBLIC_API_URL` needed to be passed as a build argument (`ARG`) during the Docker build since Next.js bakes environment variables into the build at compile time.

---

## Summary

| | |
|---|---|
| **Backend Image** | `wangchu21/be-todo:02240370` |
| **Frontend Image** | `wangchu21/fe-todo:02240370` |
| **Backend URL** | https://be-todo-02240370-1.onrender.com |
| **Frontend URL** | https://fe-todo-02240370.onrender.com |
| **Database** | MongoDB Atlas (M0 Free Tier) |