import { initRouter } from "./router/router.js";
import { loadMenusPage } from "./menusPage.js";
import { loadMenuDetail } from "./menuDetail.js";
import { refreshAuthUi } from "./authUi.js";
refreshAuthUi();

initRouter();
