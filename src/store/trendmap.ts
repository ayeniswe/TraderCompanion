import { generateUID } from "../lib/utils";
import { writable, get } from "svelte/store";
import type { Writable } from "svelte/store";
import {
  Trend,
  type Group,
  type Ticker as TrendMapTicker,
} from "../api/trendmap/model";
import { type Ticker } from "../api/ticker/model";
import { generate_layout } from "../api/trendmap/generate_layout";
import { RPCRequest, Version } from "../api/model";
import { save_layout } from "../api/trendmap/save_layout";
import { createArrayStore } from "../lib/utils";
import { get_latest_bars } from "../api/ticker/get_latest_bars";

function trendMapStore() {
  const store = createArrayStore<Group>();
  const hotNReadyStore = createArrayStore<Ticker>();

  const hotNReady: Writable<HTMLElement | null> = writable(null);
  const watchlist: Writable<HTMLElement | null> = writable(null);
  const selectedTabMenu: Writable<HTMLElement | null> = writable(null);

  const loading: Writable<boolean> = writable(false);
  const ticker: Writable<string> = writable("");
  const errorMessage: Writable<string> = writable("");
  const draggingGroupId: Writable<number> = writable(0);
  const trash: Writable<{ groupId: number; tickerId: string }> = writable({
    groupId: -1,
    tickerId: "",
  });

  const addTickerDialog: Writable<boolean> = writable(false);
  const deleteTickerDialog: Writable<boolean> = writable(false);
  const updateShortTerm: Writable<any | null> = writable(null);
  const updateMidTerm: Writable<any | null> = writable(null);
  const updateLongTerm: Writable<any | null> = writable(null);
  const updateLatestPrices: Writable<any | null> = writable(null);

  interface DraggableTicker {
    tickerId: string;
    groupId: number;
  }

  function getAllTickers() {
    const tickers: TrendMapTicker[] = [];
    get(store).forEach((group) => {
      group.tickers.forEach((value) => {
        tickers.push(value);
      });
    });

    return tickers;
  }

  function closeAddTickerDialog() {
    addTickerDialog.set(false);
    errorMessage.set("");
  }

  function timeUntilNextMinute() {
    const now = new Date();
    const seconds = 60 - now.getSeconds();
    const milliseconds = seconds * 1000 - now.getMilliseconds();
    return milliseconds;
  }

  function timeUntilNextHour() {
    const now = new Date();
    const nextHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours() + 4,
    );
    return nextHour.getTime() - now.getTime();
  }

  function timeUntilNext8AM() {
    const now = new Date();
    const next8AM = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      8,
      0,
      0,
      0,
    );
    return next8AM.getTime() - now.getTime();
  }

  function timeUntilNext5DaysAt8AM() {
    const now = new Date();
    const next5Days = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 5,
      8,
      0,
      0,
      0,
    ); // 8:00 AM in 5 days
    return next5Days.getTime() - now.getTime(); // Difference in milliseconds
  }

  return {
    ticker,
    hotNReadyStore,
    hotNReady,
    watchlist,
    selectedTabMenu,
    store,
    loading,
    errorMessage,
    addTickerDialog,
    deleteTickerDialog,
    getAllTickers,
    disableGroupNameChange(
      event: Event & { currentTarget: EventTarget & HTMLInputElement },
    ) {
      event.currentTarget.readOnly = true;
      event.currentTarget.classList.add("outline-none");
      save_layout(new RPCRequest(Version.V1, get(store), generateUID()));
    },
    allowGroupNameChange(
      event: Event & { currentTarget: EventTarget & HTMLInputElement },
    ) {
      event.currentTarget.readOnly = false;
      event.currentTarget.classList.remove("outline-none");
    },
    validateGroupInput(
      id: number,
      event: Event & { currentTarget: EventTarget & HTMLInputElement },
    ) {
      const target = event.target! as HTMLInputElement;
      target.value = target.value.replace(/[^a-zA-Z0-9\s]/g, "");
      store.get(id)!.name = target.value;
    },
    deleteTicker() {
      const { groupId, tickerId } = get(trash);

      // Remove grouping
      const grouping = document.getElementById(String(groupId))!;
      if (grouping.firstElementChild!.children.length <= 1) {
        store.remove(groupId);
        // Iterate through each group and update index position
        // TODO: better way to onyl shift what changes
        let count = 0;
        const updatedGroups = get(store).map((group) => {
          const updatedGroup = {
            id: count,
            hidden: group.hidden,
            name: group.name,
            tickers: group.tickers,
          };
          count += 1;
          return updatedGroup;
        });
        store.restore(updatedGroups);
      } else {
        // Remove ticker from persistent store
        const group = store.get(groupId)!;
        console.log(groupId, store.get(groupId));
        group.tickers = group.tickers.filter(
          (value) => value.name !== tickerId,
        );
        store.set(groupId, group);
      }

      deleteTickerDialog.set(false);

      save_layout(new RPCRequest(Version.V1, get(store), generateUID()));
    },
    showDeleteTickerWarning(
      id: number,
      event: MouseEvent & { currentTarget: EventTarget & HTMLElement },
    ) {
      event.preventDefault();
      deleteTickerDialog.set(true);
      ticker.set(event.currentTarget.id);
      trash.set({ groupId: id, tickerId: event.currentTarget.id });
    },
    closeDeleteTickerDialog() {
      deleteTickerDialog.set(false);
    },
    startUpdateReadyTickers() {
      // Calculate the initial delay until next minute
      const initial1MinuteDelay = timeUntilNextMinute();
      setTimeout(() => {
        // Start the interval to run every 1 minute
        const id = setInterval(() => {
          if (get(hotNReadyStore).length) {
            get_latest_bars(
              new RPCRequest(Version.V1, get(hotNReadyStore), generateUID()),
            );
          }
        }, 5 * 1000); // 1 minute in milliseconds
        updateLatestPrices.set(id);
      }, initial1MinuteDelay);
    },
    startUpdateWatchlist() {
      // Calculate the initial delay to the next 4 hour
      const initial4HourDelay = timeUntilNextHour();
      setTimeout(() => {
        // Start the interval to run every top 4 hour
        const id = setInterval(
          () => {
            loading.set(true);
            generate_layout(
              new RPCRequest(Version.V1, getAllTickers(), generateUID()),
            );
          },
          60 * 60 * 4 * 1000,
        ); // 4 hour in milliseconds
        updateShortTerm.set(id);
      }, initial4HourDelay);

      // Calculate delay until the next day at 8:00 AM
      const initialDayDelay = timeUntilNext8AM();
      setTimeout(() => {
        // Start the interval to run every day at 8:00 AM
        const id = setInterval(
          () => {
            loading.set(true);
            generate_layout(
              new RPCRequest(Version.V1, getAllTickers(), generateUID()),
            );
          },
          24 * 60 * 60 * 1000,
        ); // 24 hours in milliseconds
        updateMidTerm.set(id);
      }, initialDayDelay);

      // Calculate delay until the next 8:00 AM in every 5days/week
      const initial5DayDelay = timeUntilNext5DaysAt8AM();
      setTimeout(() => {
        // Start the interval to run every 5days/week at 8:00 AM
        const id = setInterval(
          () => {
            loading.set(true);
            generate_layout(
              new RPCRequest(Version.V1, getAllTickers(), generateUID()),
            );
          },
          5 * 24 * 60 * 60 * 1000,
        ); // 5 days in milliseconds
        updateLongTerm.set(id);
      }, initial5DayDelay);
    },
    stopUpdateWatchlist() {
      updateShortTerm.update((id) => {
        if (id) clearInterval(id);
        return null;
      });
      updateMidTerm.update((id) => {
        if (id) clearInterval(id);
        return null;
      });
      updateLongTerm.update((id) => {
        if (id) clearInterval(id);
        return null;
      });
    },
    stopUpdateReadyTickers() {
      updateLatestPrices.update((id) => {
        if (id) clearInterval(id);
        return null;
      });
    },
    setTicker(event: Event & { currentTarget: HTMLInputElement }) {
      const target = event.target! as HTMLInputElement;
      target.value = target.value.replace(/[^a-zA-Z]/g, "").toLocaleUpperCase();
      ticker.set(target.value);
    },
    addTicker() {
      if (get(ticker)) {
        // Create ticker
        const tickers: TrendMapTicker[] = [];
        const id = get(store).length + 1 - 1; // we want to start from 0 index
        tickers.push({
          name: get(ticker),
          group_id: id,
          mid_term: Trend.Unk,
          long_term: Trend.Unk,
          short_term: Trend.Unk,
        });
        // Create grouping
        store.add({
          name: "",
          hidden: true,
          id,
          tickers: [],
        });
        loading.set(true);
        generate_layout(new RPCRequest(Version.V1, tickers, generateUID()));
      }
    },
    closeAddTickerDialog,
    setTabMenu(ele: HTMLElement) {
      selectedTabMenu.set(ele);
    },
    openAddTickerDialog() {
      addTickerDialog.set(true);
    },
    toColor(val: Trend) {
      if (val == Trend.Down) {
        return "bg-red-500";
      } else if (val == Trend.Up) {
        return "bg-green-500";
      } else if (val == Trend.Range) {
        return "bg-yellow-500";
      } else if (val == Trend.Unk) {
        return "bg-white";
      }
    },
    handleTickerDragStart(
      event: DragEvent & { currentTarget: EventTarget & HTMLElement },
    ) {
      const ticker = event.currentTarget;
      ticker.classList.add("animate-bounce");
      event.dataTransfer!.effectAllowed = "move";

      // Group id is needed to prevent reentry on drag
      const groupId = Number(ticker.parentElement!.parentElement!.id);
      event.dataTransfer?.setData(
        "text",
        JSON.stringify({
          tickerId: ticker.id,
          // All section groups will have a internal div to contain the tickers
          // which result in a <section><div> draggable is here </div></section>
          groupId,
        }),
      );
      draggingGroupId.set(groupId);
    },
    handleTickerDragEnd(
      event: DragEvent & { currentTarget: EventTarget & HTMLElement },
    ) {
      event.currentTarget.classList.remove("animate-bounce");
      draggingGroupId.set(0);
    },
    handleTickerGroupingDragOver(
      event: DragEvent & { currentTarget: EventTarget & HTMLElement },
    ) {
      event.preventDefault(); // Necessary to allow for drop
      event.dataTransfer!.dropEffect = "move";
    },
    handleTickerGroupingDragEnter(
      event: DragEvent & { currentTarget: EventTarget & HTMLElement },
    ) {
      const newPotentialGroup = event.currentTarget;
      const newPotentialGroupId = Number(newPotentialGroup.id);

      // Children ele will disrupt drag n drop
      Array.from(newPotentialGroup.children).forEach((child) =>
        child.classList.add("pointer-events-none"),
      );

      if (
        store.get(newPotentialGroupId)!.hidden &&
        get(draggingGroupId) !== newPotentialGroupId
      ) {
        newPotentialGroup.classList.add("secondary-theme");
      }
    },
    handleTickerGroupingDragLeave(
      event: DragEvent & { currentTarget: EventTarget & HTMLElement },
    ) {
      const newPotentialGroup = event.currentTarget;
      const newPotentialGroupId = Number(newPotentialGroup.id);

      // Children ele will disrupt drag n drop
      Array.from(newPotentialGroup.children).forEach((child) =>
        child.classList.remove("pointer-events-none"),
      );

      // Avoid grouped tickers
      if (
        store.get(newPotentialGroupId)!.hidden &&
        get(draggingGroupId) !== newPotentialGroupId
      ) {
        newPotentialGroup.classList.remove("secondary-theme");
      }
    },
    handleTickerGroupingDrop(
      event: DragEvent & { currentTarget: EventTarget & HTMLElement },
    ) {
      event.preventDefault();

      const data: DraggableTicker = JSON.parse(
        event.dataTransfer!.getData("text"),
      );
      const { groupId, tickerId } = data;
      const newGroupId = Number(event.currentTarget.id);
      const newGrouping = event.currentTarget;
      const oldGrouping = document.getElementById(String(groupId))!;

      // Children ele will disrupt drag n drop
      Array.from(newGrouping.children).forEach((child) =>
        child.classList.remove("pointer-events-none"),
      );

      if (groupId !== newGroupId) {
        // Delete old group persistently
        const oldGroup = store.get(groupId)!;
        const ticker = oldGroup.tickers.find(
          (value) => value.name === tickerId,
        )!;
        ticker.group_id = newGroupId;
        oldGroup.tickers = oldGroup.tickers.filter(
          (value) => value.name !== tickerId,
        );
        store.set(groupId, oldGroup);

        // Update new group persistently
        const newGroup = store.get(newGroupId)!;
        newGroup.tickers.push(ticker);
        // Set group as active to keep wrapping
        newGroup.hidden = false;
        store.set(newGroupId, newGroup);

        // The drop will lag and thinking a ticker is still in group
        // therefore 1 would represent 0 implying it was 1 ticker in the group before
        // moving
        if (oldGrouping.firstElementChild!.children.length <= 1) {
          store.remove(groupId);
          // Iterate through each group and update index position
          // TODO: better way to onyl shift what changes
          let count = 0;
          const updatedGroups = get(store).map((group) => {
            const updatedGroup = {
              id: count,
              hidden: group.hidden,
              name: group.name,
              tickers: group.tickers,
            };
            count += 1;
            return updatedGroup;
          });
          store.restore(updatedGroups);
        }
      }

      save_layout(new RPCRequest(Version.V1, get(store), generateUID()));
    },
  };
}

export { trendMapStore };
