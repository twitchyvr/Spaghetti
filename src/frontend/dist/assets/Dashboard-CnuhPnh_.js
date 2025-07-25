import{c as a,u as x,j as s}from"./index--J-_LDiL.js";import{r as n}from"./vendor-DiiPbxpF.js";import{F as t}from"./file-text-EFeiHLF_.js";import"./router-Cc-_B42c.js";/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=a("Activity",[["path",{d:"M22 12h-4l-3 9L9 3l-3 9H2",key:"d5dnw9"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=a("ArrowDownRight",[["path",{d:"m7 7 10 10",key:"1fmybs"}],["path",{d:"M17 7v10H7",key:"6fjiku"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=a("ArrowUpRight",[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=a("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=a("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=a("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=a("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=a("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=a("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r=a("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);function D(){const{user:d}=x(),[c]=n.useState({totalDocuments:247,recentDocuments:12,activeProjects:8,teamMembers:15}),[o]=n.useState([{id:"revenue",title:"Monthly Revenue",value:"$284,590",change:12.5,changeType:"positive",icon:s.jsx(N,{size:24}),color:"success"},{id:"documents",title:"Total Documents",value:"1,247",change:18.2,changeType:"positive",icon:s.jsx(t,{size:24}),color:"primary"},{id:"efficiency",title:"Process Efficiency",value:"94.2%",change:5.1,changeType:"positive",icon:s.jsx(j,{size:24}),color:"warning"},{id:"response",title:"Avg Response Time",value:"1.2s",change:-15.2,changeType:"positive",icon:s.jsx(l,{size:24}),color:"info"}]),h=(e,i)=>{const m=e>0?p:y,v=i==="positive"?"metric-change-positive":i==="negative"?"metric-change-negative":"metric-change-neutral";return s.jsxs("div",{className:`metric-change ${v}`,children:[s.jsx(m,{size:16}),s.jsxs("span",{children:[Math.abs(e),"%"]})]})};return s.jsxs("div",{className:"dashboard",children:[s.jsx("section",{className:"dashboard-header",children:s.jsxs("div",{className:"header-content",children:[s.jsxs("div",{children:[s.jsxs("h1",{className:"dashboard-title",children:["Welcome back, ",d?.firstName||"User"]}),s.jsx("p",{className:"dashboard-subtitle",children:"Here's what's happening with your documents today."})]}),s.jsxs("div",{className:"header-actions",children:[s.jsxs("button",{className:"btn btn-secondary",children:[s.jsx(u,{size:20}),"Export Report"]}),s.jsxs("button",{className:"btn btn-primary",children:[s.jsx(g,{size:20}),"New Document"]})]})]})}),s.jsx("section",{className:"metrics-section",children:s.jsx("div",{className:"grid md:grid-cols-2 lg:grid-cols-4",children:o.map(e=>s.jsxs("div",{className:"metric-card card",children:[s.jsxs("div",{className:"metric-header",children:[s.jsx("div",{className:`metric-icon metric-icon-${e.color}`,children:e.icon}),h(e.change,e.changeType)]}),s.jsxs("div",{className:"metric-content",children:[s.jsx("h3",{className:"metric-value",children:e.value}),s.jsx("p",{className:"metric-title",children:e.title})]})]},e.id))})}),s.jsxs("section",{className:"stats-section",children:[s.jsx("h2",{className:"section-title",children:"Quick Stats"}),s.jsxs("div",{className:"grid md:grid-cols-2 lg:grid-cols-4",children:[s.jsxs("div",{className:"stat-card",children:[s.jsx("div",{className:"stat-icon",children:s.jsx(t,{size:20})}),s.jsxs("div",{className:"stat-content",children:[s.jsx("p",{className:"stat-value",children:c.totalDocuments}),s.jsx("p",{className:"stat-label",children:"Total Documents"})]})]}),s.jsxs("div",{className:"stat-card",children:[s.jsx("div",{className:"stat-icon",children:s.jsx(l,{size:20})}),s.jsxs("div",{className:"stat-content",children:[s.jsx("p",{className:"stat-value",children:c.recentDocuments}),s.jsx("p",{className:"stat-label",children:"Recent Documents"})]})]}),s.jsxs("div",{className:"stat-card",children:[s.jsx("div",{className:"stat-icon",children:s.jsx(k,{size:20})}),s.jsxs("div",{className:"stat-content",children:[s.jsx("p",{className:"stat-value",children:c.activeProjects}),s.jsx("p",{className:"stat-label",children:"Active Projects"})]})]}),s.jsxs("div",{className:"stat-card",children:[s.jsx("div",{className:"stat-icon",children:s.jsx(r,{size:20})}),s.jsxs("div",{className:"stat-content",children:[s.jsx("p",{className:"stat-value",children:c.teamMembers}),s.jsx("p",{className:"stat-label",children:"Team Members"})]})]})]})]}),s.jsxs("section",{className:"activity-section",children:[s.jsx("h2",{className:"section-title",children:"Recent Activity"}),s.jsxs("div",{className:"activity-list card",children:[s.jsxs("div",{className:"activity-item",children:[s.jsx("div",{className:"activity-icon",children:s.jsx(t,{size:16})}),s.jsxs("div",{className:"activity-content",children:[s.jsx("p",{className:"activity-title",children:"Contract Template Updated"}),s.jsx("p",{className:"activity-time",children:"2 minutes ago"})]}),s.jsx("span",{className:"status-indicator status-success",children:"Completed"})]}),s.jsxs("div",{className:"activity-item",children:[s.jsx("div",{className:"activity-icon",children:s.jsx(r,{size:16})}),s.jsxs("div",{className:"activity-content",children:[s.jsx("p",{className:"activity-title",children:"New team member added"}),s.jsx("p",{className:"activity-time",children:"1 hour ago"})]}),s.jsx("span",{className:"status-indicator status-info",children:"Info"})]}),s.jsxs("div",{className:"activity-item",children:[s.jsx("div",{className:"activity-icon",children:s.jsx(b,{size:16})}),s.jsxs("div",{className:"activity-content",children:[s.jsx("p",{className:"activity-title",children:"Monthly report generated"}),s.jsx("p",{className:"activity-time",children:"3 hours ago"})]}),s.jsx("span",{className:"status-indicator status-success",children:"Success"})]})]})]})]})}export{D as default};
