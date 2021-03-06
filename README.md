### Tampermonkey Javascript

Just a repository for any custom JS functionality included by Tampermonkey

#### Repo Structure

1. **[_atlassian_](https://github.com/jhyland87/tampermonkey/tree/master/atlassian)** - Functionality for any productions within the [Atlassian](https://www.atlassian.com) suite (hosted or otherwise).
    1. **[atlassian/_jira_](https://github.com/jhyland87/tampermonkey/tree/master/atlassian/jira)** - Functionality specific to the Atlassian **[Jira](https://www.atlassian.com/software/jira)** product.
        1. **[atlassian/jira/*kill-livestamp.js*](https://raw.githubusercontent.com/jhyland87/tampermonkey/master/atlassian/jira/kill-livestamp.js)** - Jira displays recent timestamps in a friendly format (EG: *n hour(s) ago*, *n day(s) ago*, *Yesterday*, etc). This feature [can be disabled](https://confluence.atlassian.com/jirakb/disable-relative-dates-in-jira-applications-414187622.html) on a privately hosted Jira instance, but not if it's hosted by Atlassian. This script just replaces the friendly date with an actual timestamp like `Sun, 19 Mar 2017 06:46:00 GMT`, then it disables the automatic update of the element (by changing it from a `<time>` element to a `<span>`.)
2. **[_jquery_](https://github.com/jhyland87/tampermonkey/tree/master/jquery)** - Custom jQuery functionality not specific to any site/app.
    1. **[jquery/_getPath.jquery.js_](https://github.com/jhyland87/tampermonkey/tree/master/jquery/getPath.jquery.js)** - jQuery method to return the path to the associated jQuery element within the DOM.