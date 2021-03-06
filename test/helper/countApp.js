module.exports = {
  name: 'countApp',
  defaultState: {
    count: 0
  },
  mutations: {
    add: function *() {
      yield type => {
        return () => ({type});
      };
      yield (state, action) => {
        return Object.assign({}, state, {
          count: state.count + 1
        });
      };
    }
  }
};
