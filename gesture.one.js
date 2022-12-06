//TODO: add practical feedback, like angle or endPosition for flick or total time for press and such

let addGestureListener = function (elem, gestures) {
  
  //consider adding rotate and scale (pinch/spread are NOT for scaling/zooming)
  let gesture = {};
  let touches = {};
  
  let getGesture = () => {
    let arr = [];
    for (const [key, value] of Object.entries(gesture))
      if (value)
        arr.push(key);
    
    if (arr.length === 1 && gestures[arr[0]])
      return gestures[arr[0]];
    else
      return () => {};
  }
  
  let getPos = (touch) => {
    let rect = touch.target.getBoundingClientRect();
    return {x: touch.clientX-rect.left, y: touch.clientY-rect.top};
  }

  let touchstart = (evt) => {
    evt.preventDefault();
    
    switch (evt.targetTouches.length) {
      case 1:
        gesture.tap = true;
        gesture.press = true;
        gesture.drag = true;
        gesture.flick = true;
        gesture.pinch = true;
        gesture.spread = true;
        break;
      case 2:
        gesture.tap = false;
        gesture.press = false;
        gesture.drag = false;
        gesture.flick = false;
        //if 2 fingers hit simultaneously case 1 never happens
        if (!gesture.pinch) {
          gesture.pinch = true;
          gesture.spread = true;
        }
        break;
      default: 
        gesture.tap = false;
        gesture.press = false;
        gesture.drag = false;
        gesture.flick = false;
        gesture.pinch = false;
        gesture.spread = false;
    }
    
    for (let touch of evt.changedTouches)
      touches[touch.identifier] = {initialPosition:getPos(touch), position: getPos(touch), initialTime: Date.now()};
  };
  
  let touchmove = (evt) => {
    evt.preventDefault();
    switch (Object.keys(touches).length) {
      case 1:
        let touch = evt.targetTouches[0];
          if (touches[touch.identifier]) {
            if (Math.abs(getPos(touch).x - touches[touch.identifier].initialPosition.x) > 10 || Math.abs(getPos(touch).y - touches[touch.identifier].initialPosition.y) > 10) {
              gesture.tap = false;
              gesture.press = false;
              gesture.pinch = false;
              gesture.spread = false;
              
              let deltaTime = Date.now()-touches[touch.identifier].initialTime;
              if (deltaTime > 200) {
                gesture.flick = false;
              }
            }
            touches[touch.identifier].position = getPos(touch);
          }
        break;
      case 2:
        let [touch1, touch2] = Object.values(touches);
        
        let prevDist = Math.sqrt(Math.pow(touch1.initialPosition.x - touch2.initialPosition.x, 2)+Math.pow(touch1.initialPosition.y - touch2.initialPosition.y, 2));
        let currDist = Math.sqrt(Math.pow(getPos(evt.targetTouches[0]).x - getPos(evt.targetTouches[1]).x, 2) + Math.pow(getPos(evt.targetTouches[0]).y - getPos(evt.targetTouches[1]).y, 2));
        
        let deltaDist = currDist - prevDist;
        
        if (deltaDist > 10)
          gesture.pinch = false;
        else if (deltaDist < -10)
          gesture.spread = false;
        
        break;
    }
  };
  
  let touchend = (evt) => {
    evt.preventDefault();
    
    switch (Object.keys(touches).length) {
      case 1:
        gesture.pinch = false;
        gesture.spread = false;
        
        let touch = Object.values(touches)[0];
        
        if (Date.now() - touch.initialTime > 200) {
          gesture.tap = false;
          gesture.flick = false;
        } else {
          gesture.press = false;
          gesture.drag = false;
        }
        
        if (gesture.press)
          gesture.drag = false;
        if (gesture.tap)
          gesture.flick = false;
        
        break;
      case 2:
        gesture.tap = false;
        gesture.press = false;
        gesture.drag = false;
        gesture.flick = false;
        if (gesture.pinch && gesture.spread) {
//consider twoTap, twoPress, and twoDrag
          gesture.pinch = false;
          gesture.spread = false;
}
        break;
    }
    if (Object.keys(touches).length>0)
        getGesture()(touches);
    
    gesture = {};
    touches = {};
  };
  
  let touchcancel = (evt) => {
    evt.preventDefault();
  };
  
  elem.addEventListener("touchstart", touchstart);
  elem.addEventListener("touchmove", touchmove);
  elem.addEventListener("touchend", touchend);
  elem.addEventListener("touchcancel", touchcancel);
};

export {addGestureListener};
