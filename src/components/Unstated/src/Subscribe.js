class Subscribe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.instances = [];
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.unsubscribe();
  }

  unsubscribe() {
    this.instances.forEach((container) => {
      container.unsubscribe(this.onUpdate);
    });
  }

  onUpdate = () => new Promise((resolve) => {
    if (!this.unmounted) {
      this.setState(DUMMY_STATE, resolve);
    } else {
      resolve();
    }
  })

  _createInstances(map, containers) {
    this.unsubscribe();

    if (map === null) {
      throw new Error('You must wrap your <Subscribe> components with a <Provider>');
    }

    const safeMap = map;
    const instances = containers.map((ContainerItem) => {
      let instance;

      if (
        typeof ContainerItem === 'object' &&
        ContainerItem instanceof Container
      ) {
        instance = ContainerItem;
      } else {
        instance = safeMap.get(ContainerItem);

        if (!instance) {
          instance = new ContainerItem();
          safeMap.set(ContainerItem, instance);
        }
      }

      instance.unsubscribe(this.onUpdate);
      instance.subscribe(this.onUpdate);

      return instance;
    });

    this.instances = instances;
    return instances;
  }

  render() {
    return (
      <StateContext.Consumer>
        {
          map => this.props.children.apply(
            null,
            this._createInstances(map, this.props.to),
          )
        }
      </StateContext.Consumer>
    );
  }
}
