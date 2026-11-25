// KD-988: the "Record me" recorder moved to @klavity/core so the Chrome extension's composer can offer it
// too. Re-exported here so the widget, the SDK and their tests keep importing "./recorder" unchanged.
export * from "@klavity/core/recorder"
