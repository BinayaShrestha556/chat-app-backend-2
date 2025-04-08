import dotenv from "dotenv";

dotenv.config();

import { server } from "./socket/socket";

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
