export const formatExplorer = (explorerUrl: string, url: string) => {
  return `${explorerUrl}${explorerUrl.endsWith("/") ? "" : "/"}${url}`;
};
