module.exports = function (...reduxBricks) {
  let $actions = {};
  let $reducers = {};
  reduxBricks.forEach(reduxBrick => {
    const {name, defaultState = {}, mutations = {}} = reduxBrick;

    if (!name)
      throw new Error('every redux brick should own its name');
    if ($reducers.hasOwnProperty(name))
      throw new Error('redux brick name should be unique');

    let stateHandlers = {};
    let actions = {};
    Object.keys(mutations).forEach(actionName=> {
      const generatorFn = mutations[actionName];
      let actionLackOfTypeFn, stateHandler;
      try {
        const iterator = generatorFn();
        actionLackOfTypeFn = iterator.next().value;
        stateHandler = iterator.next().value;
      } catch (e) {
        throw new Error(`invalid mutation ${name}-${actionName}`);
      }

      if (!actionLackOfTypeFn || !stateHandler || !isInstance(actionLackOfTypeFn, Function) || !isInstance(stateHandler, Function)) {
        throw new Error(`${name}-${actionName} mutation should yield two functions`);
      }

      const action = actionLackOfTypeFn(`${name}-${actionName}`);
      actions[actionName] = action;
      if (!isInstance(action, Function))
        throw new Error(`${name}-${actionName} fails to compile the first yield value to a valid action creator function`);
      stateHandlers[actionName] = stateHandler;
    });

    const reducer = function (state = defaultState, action) {
      const [setName, actionName] = action.type.split('-');
      if (setName === name && stateHandlers.hasOwnProperty(actionName)) {
        return stateHandlers[actionName](state, action);
      }
      return state;
    };

    registerActions(actions, name, $actions);
    $reducers[name] = reducer;
  });
  return {
    actions: $actions,
    reducers: $reducers,
  };
};

function registerActions(actions, setName, $actions) {
  const actionNames = Object.keys(actions);
  if (!actionNames.length)
    return;
  const set = $actions[setName] = {};
  actionNames.forEach(actionName => {
    set[actionName] = actions[actionName];
  });
}

function isInstance(instance, prototype) {
  return instance instanceof prototype;
}
