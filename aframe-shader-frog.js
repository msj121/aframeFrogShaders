// var ShaderFrogRuntime=function(e){function r(t){if(a[t])return a[t].exports;var n=a[t]={exports:{},id:t,loaded:!1};return e[t].call(n.exports,n,n.exports,r),n.loaded=!0,n.exports}var a={};return r.m=e,r.c=a,r.p="",r(0)}([function(e,r,a){"use strict";function t(e){return e&&e.__esModule?e:{"default":e}}function n(){}function i(){var e=arguments.length,r=arguments[0];if(2>e)return r;for(var a=1;e>a;a++)for(var t=arguments[a],n=Object.keys(t||{}),i=n.length,s=0;i>s;s++){var o=n[s];r[o]=t[o]}return r}function s(e){return i({},e)}function o(e){var r=s(e),a=void 0,t=void 0;for(a=0;t=arguments[a++ +1];)delete r[t];return r}Object.defineProperty(r,"__esModule",{value:!0});var u=a(1),d=t(u);n.prototype={mainCamera:null,cubeCameras:{},reserved:{time:null,cameraPosition:null},umap:{"float":{type:"f",value:0},"int":{type:"i",value:0},vec2:{type:"v2",value:function(){return new d["default"].Vector2}},vec3:{type:"v3",value:function(){return new d["default"].Vector3}},vec4:{type:"v4",value:function(){return new d["default"].Vector4}},samplerCube:{type:"t"},sampler2D:{type:"t"}},getUmap:function(e){var r=this.umap[e].value;return"function"==typeof r?r():r},load:function(e,r){var a=this,t=e,n="string"==typeof e;n&&(t=[e]);for(var i=new Array(t.length),s=0,o=function(e,o){var u=new d["default"].XHRLoader;u.load(o,function(u){var d=void 0;try{d=JSON.parse(u),delete d.id}catch(m){throw new Error("Could not parse shader"+o+"! Please verify the URL is correct.")}a.add(d.name,d),i[e]=d,++s===t.length&&r(n?i[0]:i)})},u=0;u<t.length;u++)o(u,t[u])},registerCamera:function(e){if(!(e instanceof d["default"].Camera))throw new Error("Cannot register a non-camera as a camera!");this.mainCamera=e},registerCubeCamera:function(e,r){if(!r.renderTarget)throw new Error("Cannot register a non-camera as a camera!");this.cubeCameras[e]=r},unregisterCamera:function(e){if(e in this.cubeCameras)delete this.cubeCameras[e];else{if(e!==this.mainCamera)throw new Error("You never registered camera "+e);delete this.mainCamera}},updateSource:function(e,r,a){if(a=a||"name",!this.shaderTypes[e])throw new Error("Runtime Error: Cannot update shader "+e+" because it has not been added.");var t=this.add(e,r),n=void 0,s=void 0;for(s=0;n=this.runningShaders[s++];)n[a]===e&&(i(n.material,o(t,"id")),n.material.needsUpdate=!0)},renameShader:function(e,r){var a=void 0,t=void 0;if(!(e in this.shaderTypes))throw new Error("Could not rename shader "+e+" to "+r+". It does not exist.");for(this.shaderTypes[r]=this.shaderTypes[e],delete this.shaderTypes[e],a=0;t=this.runningShaders[a++];)t.name===e&&(t.name=r)},get:function(e){var r=this.shaderTypes[e];return r.initted||this.create(e),r.material},add:function(e,r){var a=s(r),t=void 0;a.fragmentShader=r.fragment,a.vertexShader=r.vertex,delete a.fragment,delete a.vertex;for(var n in a.uniforms)t=a.uniforms[n],null===t.value&&(a.uniforms[n].value=this.getUmap(t.glslType));return e in this.shaderTypes?i(this.shaderTypes[e],a):this.shaderTypes[e]=a,a},create:function(e){var r=this.shaderTypes[e];return r.material=new d["default"].RawShaderMaterial(r),this.runningShaders.push(r),r.init&&r.init(r.material),r.material.needsUpdate=!0,r.initted=!0,r.material},updateRuntime:function(e,r,a){a=a||"name";var t=void 0,n=void 0,i=void 0,s=void 0;for(n=0;t=this.runningShaders[n++];)if(t[a]===e)for(i in r.uniforms)i in this.reserved||i in t.material.uniforms&&(s=r.uniforms[i],"t"===s.type&&"string"==typeof s.value&&(s.value=this.cubeCameras[s.value].renderTarget),t.material.uniforms[i].value=r.uniforms[i].value)},updateShaders:function(e,r){var a=void 0,t=void 0;for(r=r||{},t=0;a=this.runningShaders[t++];){for(var n in r.uniforms)n in a.material.uniforms&&(a.material.uniforms[n].value=r.uniforms[n]);"cameraPosition"in a.material.uniforms&&this.mainCamera&&(a.material.uniforms.cameraPosition.value=this.mainCamera.position.clone()),"viewMatrix"in a.material.uniforms&&this.mainCamera&&(a.material.uniforms.viewMatrix.value=this.mainCamera.matrixWorldInverse),"time"in a.material.uniforms&&(a.material.uniforms.time.value=e)}},shaderTypes:{},runningShaders:[]},r["default"]=n,e.exports=r["default"]},function(e,r){e.exports=THREE}]);
AFRAME.registerSystem('shader-frog', {
  init:function(){
    this.frog_runtime = new ShaderRuntime();
    this.clock = new THREE.Clock();
    var self = this;
        
    var scene = document.querySelector('a-scene');
    if (scene.hasLoaded) {
      registerCamera().bind(this);;
    } else {
      scene.addEventListener('loaded', registerCamera);
    }
    function registerCamera () {
       var camera = document.querySelector("a-scene").systems["camera"];
       if(camera && camera.sceneEl && camera.sceneEl.camera){
         camera = camera.sceneEl.camera;
         self.frog_runtime.registerCamera(camera);
       }
    }
  },
  tick: function (t) {
    this.frog_runtime.updateShaders( this.clock.getElapsedTime() );
  }
});
AFRAME.registerComponent('shader-frog',{
  schema:{
    src:{type:"src"}
  },
  init: function(){
    this.originalMaterial = this.el.getObject3D('mesh').material;
  },
  update: function(){
    this.system.frog_runtime.load(this.data.src,function(shaderData){
      var material = this.system.frog_runtime.get(shaderData.name);
      this.el.getObject3D('mesh').material = material;
    }.bind(this));
  },
  remove: function(){
    this.el.getObject3D('mesh').material = this.originalMaterial;
  }
});

let defaultThreeUniforms = [
    'normalMatrix', 'viewMatrix', 'projectionMatrix', 'position', 'normal',
    'modelViewMatrix', 'uv', 'uv2', 'modelMatrix'
];

function ShaderRuntime() {}

ShaderRuntime.prototype = {

    mainCamera: null,
    cubeCameras: {},

    reserved: { time: null, cameraPosition: null },

    umap: {
        float: { type: 'f', value: 0 },
        int: { type: 'i', value: 0 },
        vec2: { type: 'v2', value() { return new THREE.Vector2(); } },
        vec3: { type: 'v3', value() { return new THREE.Vector3(); } },
        vec4: { type: 'v4', value() { return new THREE.Vector4(); } },
        samplerCube: { type: 't' },
        sampler2D: { type: 't' }
    },

    getUmap( type ) {
        let value = this.umap[ type ].value;
        return typeof value === 'function' ? value() : value;
    },

    load( sourceOrSources, callback ) {

        let sources = sourceOrSources,
            onlyOneSource = typeof sourceOrSources === 'string';

        if( onlyOneSource ) {
            sources = [ sourceOrSources ];
        }

        let loadedShaders = new Array( sources.length ),
            itemsLoaded = 0;

        let loadSource = ( index, source ) => {

            let loader = new THREE.XHRLoader();
            loader.load( source, ( json ) => {

                let parsed;
                try {
                    parsed = JSON.parse( json );
                    delete parsed.id; // Errors if passed to rawshadermaterial :(
                } catch( e ) {
                    throw new Error( 'Could not parse shader' + source + '! Please verify the URL is correct.' );
                }
                this.add( parsed.name, parsed );
                loadedShaders[ index ] = parsed;

                if( ++itemsLoaded === sources.length ) {
                    callback( onlyOneSource ? loadedShaders[ 0 ] : loadedShaders );
                }

            });
        };

        for( let x = 0; x < sources.length; x++ ) {
            loadSource( x, sources[ x ] );
        }

    },

    registerCamera( camera ) {

        if( !( camera instanceof THREE.Camera ) ) {
            throw new Error( 'Cannot register a non-camera as a camera!' );
        }

        this.mainCamera = camera;

    },

    registerCubeCamera( name, camera ) {

        if( !camera.renderTarget ) {
            throw new Error( 'Cannot register a non-camera as a camera!' );
        }

        this.cubeCameras[ name ] = camera;

    },

    unregisterCamera( name ) {

        if( name in this.cubeCameras ) {

            delete this.cubeCameras[ name ];
            
        } else if( name === this.mainCamera ) {

            delete this.mainCamera;

        } else {

            throw new Error( 'You never registered camera ' + name );

        }

    },

    updateSource( identifier, config, findBy ) {

        findBy = findBy || 'name';

        if( !this.shaderTypes[ identifier ] ) {
            throw new Error( 'Runtime Error: Cannot update shader ' + identifier + ' because it has not been added.' );
        }

        let newShaderData = this.add( identifier, config ),
            shader, x;

        for( x = 0; shader = this.runningShaders[ x++ ]; ) {
            if( shader[ findBy ] === identifier ) {
                extend( shader.material, omit( newShaderData, 'id' ) );
                shader.material.needsUpdate = true;
            }
        }

    },

    renameShader( oldName, newName ) {

        let x, shader;

        if( !( oldName in this.shaderTypes ) ) {
            throw new Error('Could not rename shader ' + oldName + ' to ' + newName + '. It does not exist.');
        }

        this.shaderTypes[ newName ] = this.shaderTypes[ oldName ];
        delete this.shaderTypes[ oldName ];

        for( x = 0; shader = this.runningShaders[ x++ ]; ) {
            if( shader.name === oldName ) {
                shader.name = newName;
            }
        }

    },

    get( identifier ) {

        let shaderType = this.shaderTypes[ identifier ];

        if( !shaderType.initted ) {

            this.create( identifier );
        }

        return shaderType.material;

    },

    add( shaderName, config ) {

        let newData = clone( config ),
            uniform;
        newData.fragmentShader = config.fragment;
        newData.vertexShader = config.vertex;
        delete newData.fragment;
        delete newData.vertex;

        for( var uniformName in newData.uniforms ) {
            uniform = newData.uniforms[ uniformName ];
            if( uniform.value === null ) {
                newData.uniforms[ uniformName ].value = this.getUmap( uniform.glslType );
            }
        }
        
        if( shaderName in this.shaderTypes ) {
            // maybe not needed? too sleepy, need document
            extend( this.shaderTypes[ shaderName ], newData );
        } else {
            this.shaderTypes[ shaderName ] = newData;
        }

        return newData;

    },

    create( identifier ) {

        let shaderType = this.shaderTypes[ identifier ];

        shaderType.material = new THREE.RawShaderMaterial( shaderType );

        this.runningShaders.push( shaderType );

        shaderType.init && shaderType.init( shaderType.material );
        shaderType.material.needsUpdate = true;

        shaderType.initted = true;

        return shaderType.material;

    },

    updateRuntime( identifier, data, findBy ) {

        findBy = findBy || 'name';

        let shader, x, uniformName, uniform;

        // This loop does not appear to be a slowdown culprit
        for( x = 0; shader = this.runningShaders[ x++ ]; ) {
            if( shader[ findBy ] === identifier ) {
                for( uniformName in data.uniforms ) {

                    if( uniformName in this.reserved ) {
                        continue;
                    }

                    if( uniformName in shader.material.uniforms ) {

                        uniform = data.uniforms[ uniformName ];

                        // this is nasty, since the shader serializes
                        // CubeCamera model to string. Maybe not update it at
                        // all?
                        if( uniform.type === 't' && typeof uniform.value === 'string' ) {
                            uniform.value = this.cubeCameras[ uniform.value ].renderTarget;
                        }

                        shader.material.uniforms[ uniformName ].value = data.uniforms[ uniformName ].value;
                    }
                }
            }
        }

    },

    // Update global shader uniform values
    updateShaders( time, obj ) {

        let shader, x;

        obj = obj || {};

        for( x = 0; shader = this.runningShaders[ x++ ]; ) {

            for( let uniform in obj.uniforms ) {
                if( uniform in shader.material.uniforms ) {
                    shader.material.uniforms[ uniform ].value = obj.uniforms[ uniform ];
                }
            }

            if( 'cameraPosition' in shader.material.uniforms && this.mainCamera ) {

                shader.material.uniforms.cameraPosition.value = this.mainCamera.position.clone();

            }

            if( 'viewMatrix' in shader.material.uniforms && this.mainCamera ) {

                shader.material.uniforms.viewMatrix.value = this.mainCamera.matrixWorldInverse;

            }

            if( 'time' in shader.material.uniforms ) {

                shader.material.uniforms.time.value = time;

            }

        }

    },

    shaderTypes: {},

    runningShaders: []

};

// Convenience methods so we don't have to include underscore
function extend() {
    let length = arguments.length,
        obj = arguments[ 0 ];

    if( length < 2 ) {
        return obj;
    }

    for( let index = 1; index < length; index++ ) {
        let source = arguments[ index ],
            keys = Object.keys( source || {} ),
            l = keys.length;
        for( let i = 0; i < l; i++ ) {
            let key = keys[i];
            obj[ key ] = source[ key ];
        }
    }

    return obj;
}

function clone( obj ) {
    return extend( {}, obj );
}

function omit( obj, ...keys ) {
    let cloned = clone( obj ), x, key;
    for( x = 0; key = keys[ x++ ]; ) {
        delete cloned[ key ];
    }
    return cloned;
}
