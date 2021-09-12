import { Embed } from "./components/Embed";
import { createIframe } from "./utils";

class Player extends Embed {
  buildIframe() {
    return createIframe(this._options, "player");
  }
}

export { Embed, Player };
