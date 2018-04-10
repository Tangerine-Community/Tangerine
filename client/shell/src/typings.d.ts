/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
interface Window {
  isCordovaApp: any;
  chcp: any;
  resolveLocalFileSystemURL: any;
}
