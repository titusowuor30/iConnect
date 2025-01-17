# iConnect
- iConnect is customized middleware software that runs inside electron. The Software focuses on reading data from serial devices i.e weight indicators(Avery Weigh Tronix) and so on. The system also integrates external hardware systems like, cameras, high speed weighing systems.

### powered by Electron
## quick-start-guide

**Clone and run for a quick way to see Electron in action.**

[Quick Start Guide](https://electronjs.org/docs/latest/tutorial/quick-start) within the Electron documentation.

### iConnect files:

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `main.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.
- `index.html` - A web page to render. This is the app's **renderer process**.
- `preload.js` - A content script that runs before the renderer process loads.

## To Use

To clone and run this repository you'll need 
```bash
# Clone this repository
git clone url
# Go into the repository
cd iConnect
# Install dependencies
npm install
# Run the app
npm start
```

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.

## Resources for Learning Electron

- [electronjs.org/docs](https://electronjs.org/docs) - all of Electron's documentation
- [Electron Fiddle](https://electronjs.org/fiddle) - Electron Fiddle, an app to test small Electron experiments

## License

[CC0 1.0 (Public Domain)](LICENSE.md)
