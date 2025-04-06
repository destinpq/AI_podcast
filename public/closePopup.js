// Script to forcibly close any stuck dialog popups
(function() {
  // Function to close popups
  function closeStuckPopups() {
    console.log("Checking for stuck popups to close...");
    
    // Close by clicking close buttons
    const closeButtons = document.querySelectorAll('[aria-label="close"]');
    closeButtons.forEach((button) => {
      if (button instanceof HTMLElement) {
        console.log("Found close button, clicking it");
        button.click();
      }
    });
    
    // Remove backdrop and any open dialogs
    const dialogBackdrops = document.querySelectorAll('.MuiBackdrop-root');
    dialogBackdrops.forEach((backdrop) => {
      if (backdrop instanceof HTMLElement) {
        console.log("Found backdrop, removing it");
        backdrop.style.display = 'none';
      }
    });
    
    // Force style changes on any open dialogs
    const dialogs = document.querySelectorAll('.MuiDialog-root');
    dialogs.forEach((dialog) => {
      if (dialog instanceof HTMLElement) {
        console.log("Found dialog, hiding it");
        dialog.style.display = 'none';
      }
    });
    
    // Remove any body styles that prevent scrolling
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
  
  // Close popups when the script runs
  closeStuckPopups();
  
  // Add keyboard shortcut to close popups (Shift+Escape)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && event.shiftKey) {
      console.log("Detected Shift+Escape, closing popups");
      closeStuckPopups();
    }
  });
  
  // Also run after a short delay to catch late-rendered dialogs
  setTimeout(closeStuckPopups, 500);
})();
