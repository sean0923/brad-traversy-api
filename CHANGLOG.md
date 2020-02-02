## Seperate router from index.ts

In `src/index

```js
// Route files
import { bootcampsRouter } from './routes/bootcamps';
// ...
app.use('/api/v1/bootcamps', bootcampsRouter);
```

In `src/routes/bootcampes

```js
export const bootcampsRouter = express.Router();

bootcampsRouter.get('/', (req, res) => {
  res.send('a');
});
```
