export class PopupOptions {
  position: google.maps.LatLng;
  map: google.maps.Map;
  label: string;
}

export class Popup {
  overlayView: google.maps.OverlayView;
  position: google.maps.LatLng;
  anchor: Element;
  map: google.maps.Map;
  mapListener: google.maps.MapsEventListener;
  mapMoved = false;

  constructor(opts: PopupOptions) {
    this.overlayView = new google.maps.OverlayView();
    this.map = opts.map;
    this.position = opts.position;

    // Create new <div> element to contain content
    const content = document.createElement('div');
    content.classList.add('popup-bubble-content');

    // Insert text into content bubble
    const newContent = document.createTextNode(opts.label);
    content.appendChild(newContent);

    const pixelOffset = document.createElement('div');
    pixelOffset.classList.add('popup-bubble-anchor');
    pixelOffset.appendChild(content);

    this.anchor = document.createElement('div');
    this.anchor.classList.add('popup-tip-anchor');
    this.anchor.appendChild(pixelOffset);

    // Optionally stop clicks, etc., from bubbling up to the map.
    this.stopEventPropagation();

    this.setMap(opts.map);

    this.overlayView.onAdd = () => this.onAdd();
    this.overlayView.onRemove = () => this.onRemove();
    this.overlayView.draw = () => this.draw();
  }

  clickStart(evt) {
    this.mapListener = this.map.addListener('bounds_changed', () => this.mapMoved = true);
  }

  clickEnd(evt) {
    if (this.mapListener != null) {
      if (!this.mapMoved) {
        console.log('Firing');
        google.maps.event.trigger(this.overlayView, 'click');
      }
      this.mapListener.remove();
      this.mapListener = null;
      this.mapMoved = false;
    }
  }

  onAdd() {
    this.overlayView.getPanes().overlayMouseTarget.appendChild(this.anchor);
    google.maps.event.addDomListener(this.anchor, 'mousedown', (evt) => this.clickStart(evt));
    google.maps.event.addDomListener(this.anchor, 'mouseup', (evt) => this.clickEnd(evt));
    google.maps.event.addDomListener(this.anchor, 'touchstart', (evt) => this.clickStart(evt));
    google.maps.event.addDomListener(this.anchor, 'touchend', (evt) => this.clickEnd(evt));
  }

  onRemove() {
    if (this.anchor.parentElement) {
      this.anchor.parentElement.removeChild(this.anchor);
    }
  }

  draw() {
    const divPosition = this.overlayView.getProjection().fromLatLngToDivPixel(this.position);
    const display = Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ? 'block' : 'none';

    if (display === 'block') {
      this.anchor['style'].left = divPosition.x + 'px';
      this.anchor['style'].top = divPosition.y + 'px';
    }
    if (this.anchor['style'].display !== display) {
      this.anchor['style'].display = display;
    }
    this.anchor['style'].userSelect = 'none';
  }

  stopEventPropagation() {
    this.anchor['style'].cursor = 'pointer';

    ['click', 'dblclick', 'contextmenu', 'pointerdown']
      .forEach(event => {
        this.anchor.addEventListener(event, function(e) {
          e.stopPropagation();
        });
      });
  };

  addListener(eventName: string, handler: (...args: any[]) => void): google.maps.MapsEventListener {
    return this.overlayView.addListener(eventName, handler);
  }

  setMap(map: google.maps.Map | google.maps.StreetViewPanorama | null) {
    this.overlayView.setMap(map);
  }

  set(key: string, value: any) {
    this.overlayView.set(key, value);
  }

  get(key: string) {
    return this.overlayView.get(key);
  }
}
