import {FetchRequest} from '@supermapgis/iclient-common/util/FetchRequest';
import { Util } from '@supermapgis/iclient-common/commontypes/Util';
/**
 * 获取当前用户的用户名。
 * @param rootUrl 
 * @returns 
 */
export function getUserName(rootUrl: string): Promise<string | null> {
    const url = Util.urlPathAppend(rootUrl, 'web/mycontent/account.json');
    return FetchRequest.get(url, null, {
        withCredentials: true
    })
        .then((res) => res.json())
        .then((data) => data.name)
        .catch((error) => {
          console.log(error);
          return null;
        });
}
function isSuperMapOnline(url: string): boolean {
    let testIndex = url.indexOf('https://itest.supermapol.com/apps');
    let onlineIndex = url.indexOf('https://www.supermapol.com/apps');
    return testIndex > -1 || onlineIndex > -1;
}
/**
 * 打开当前用户的详情页面。
 * @param rootUrl 
 * @param openInNewWindow 
 */
export function openUserDetails(rootUrl: string, openInNewWindow: boolean = true): void {
    // ONLINE的账户信息：https://itest.supermapol.com/web/mycontent/cloud/account
    // iportal的账户地址
    let url = Util.urlPathAppend(rootUrl, 'web-ui/my-account/account');
    if (isSuperMapOnline(rootUrl)) {
        // online的账户地址
        url = Util.urlPathAppend(rootUrl, 'web/mycontent/cloud/account');
    }
    if (openInNewWindow) {
        window.open(url);
    } else {
        window.location.href = url;
    }
}