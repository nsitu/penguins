const viz = document.getElementById("viz");
const controlsEl = document.getElementById("controls");

  const FILTER_FIELD_CAPTION = "Island";

  function getReplaceEnum() {
    return (globalThis.FilterUpdateType?.Replace) ?? "replace";
  }

  function getCheckedValues() {
    return [...controlsEl.querySelectorAll('input[type="checkbox"]:checked')].map(i => i.value);
  }

  async function applyIslandFilter() {
    const values = getCheckedValues();

    // Guard: workbook can be briefly undefined right after load.
   
    if (!viz.workbook)   return; 

    const activeSheet = viz.workbook.activeSheet; // now safe
    

    if (values.length === 0) {
      // Reset: select all checkboxes when none are selected
      controlsEl.querySelectorAll('input[type="checkbox"]').forEach(i => (i.checked = true));
      await activeSheet.clearFilterAsync(FILTER_FIELD_CAPTION);
      return;
    }

    await activeSheet.applyFilterAsync(
      FILTER_FIELD_CAPTION,
      values,
      getReplaceEnum()
    );

    
  }

  // Disable UI until viz is actually interactive
  controlsEl.querySelectorAll("input").forEach(i => (i.disabled = true));

  // Most reliable: wait for the first time the viz is interactive.
  viz.addEventListener("firstinteractive", async () => {
    controlsEl.querySelectorAll("input").forEach(i => (i.disabled = false));

    controlsEl.addEventListener("change", () => applyIslandFilter());

    // Apply initial filter state
    await applyIslandFilter();
  });

  // Fallback: if the event doesn't fire for some reason, try after ready.
  // (This prevents "dead UI" in edge cases.)
  await viz.ready;
  if (!viz.workbook) {
    // give it a moment; no busy loop
    setTimeout(() => {
      if (viz.workbook) viz.dispatchEvent(new Event("firstinteractive"));
    }, 250);
  }