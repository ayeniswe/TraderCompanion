import { appStore } from './app';
import { trendMapStore } from './trendmap';

const trendMap = trendMapStore();
const app = appStore();

export { trendMap, app };
