<script lang="ts">
  import { app } from "../../store";
  const { changeTheme } = app;
</script>

<button
  on:click={changeTheme}
  class="absolute top-0 m-4 z-20 w-4 h-4 rounded-full transition-all duration-200 theme"
></button>
