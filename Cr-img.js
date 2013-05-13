/*Cr.img has some basic uses surrounding attaching onload events correctly for IE 
In IE 7 for ex. load events on image fire as soon as the src attribute is set for
a created image element.  This means that attachng the listener after the img has
been inserted into the DOM tree is way too late to catch the load event.  This is
prevented by using a second array of events within the attributes object. The key
for the normal events array [event(s)] is ammended with an additonal key called
[loadevent(s)].  This new attribute will attach events to the element immediately
and instead of wating for the node to be appended to the page.  To correctly use
loadevents with Cr.elm independend of Cr.img you must ensure that the loadevents
are defined in the 'set' of attributes before the src is defined.  This function
'ensures' that the attributes are in the correct order. */
Cr.img = function(attributes){
	events_key=false;
	load_event_key=false;
	//find the event keys in the attributes arrays
	for( i in attributes ){
		if( i.substring(0,5) == 'event' ){// || events
			events_key=i;
		}else if( i.substring(0,9) == 'loadevent' ){// || loadevents
			load_event_key=i;
		}
	}
	if(!events_key){
		return this.elm('img',attributes);//we have no possible mis-defined load events
	}
	//make sure we have arrays for each
	if(!load_event_key){load_event_key='loadevents';attributes[load_event_key]=[];}
	if(!events_key){events_key='events';attributes[events_key]=[];}
	//make sure they are all arrays of event arrays
	if(typeof(attributes[load_event_key][0])=='string') attributes[load_event_key] = [attributes[load_event_key]];
	if(typeof(attributes[events_key][0])=='string') attributes[events_key] = [attributes[events_key]];
	//strip load events out of the events array and put them in the load event array
	var newEventsKeyArr=[];
	for( i in attributes[events_key] ){
		if( attributes[events_key][i][0] == 'load' ){
			attributes[load_event_key].push(attributes[events_key][i]);
		}else
			newEventsKeyArr.push(attributes[events_key][i]);
	}
	attributes[events_key] = newEventsKeyArr;
	var newAttributesObj={'loadevents':attributes[load_event_key], 'events':attributes[events_key]};
	for( i in attributes ){
		if(i==load_event_key||i==events_key)continue;
		newAttributesObj[i]=attributes[i];
	}
	attributes=newAttributesObj;
	return this.elm('img',attributes);
};