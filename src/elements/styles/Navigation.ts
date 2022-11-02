import { css } from "lit";

export default css`
:host {
  display: block;
  background-color: var(--api-navigation-background-color, inherit);
  color: var(--api-navigation-color, inherit);
  overflow: auto;
  position: relative;
  font-size: var(--arc-font-body1-font-size, inherit);
  font-weight: var(--arc-font-body1-font-weight, inherit);
  line-height: var(--arc-font-body1-line-height, inherit);
  outline: none;
}

.wrapper {
  color: inherit;
}

.section-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  padding: var(--api-navigation-section-title-padding, 4px 16px);
  background-color: var(
    --api-navigation-section-title-background-color,
    inherit
  );
  user-select: none;
  min-height: 40px;
  color: var(--api-navigation-header-color, inherit);
  outline: none;
}

.section-title:focus {
  background-color: var(
    --api-navigation-section-title-focus-background-color,
    #e5e5e5
  );
}

.title-h3,
.list-item.summary {
  font-size: var(--api-navigation-list-section-font-size, 16px);
  font-weight: var(--api-navigation-list-section-font-weight, 500);
  line-height: 24px;
  flex: 1;
  flex-basis: 0.000000001px;
  padding: 0;
  margin: 0;
}

.list-item.summary {
  padding: var(--api-navigation-list-item-summary-padding, 12px 16px);
}

.list-item.endpoint {
  font-weight: var(--api-navigation-endpoint-font-weight, 500);
  font-size: var(--api-navigation-endpoint-font-size, 15px);
  user-select: none;
  display: flex;
  flex-direction: row;
}

.list-item.endpoint:first-of-type {
  margin-top: 0px;
}

.path-details {
  flex: 1;
  flex-basis: 0.000000001px;
}

.path-name,
.endpoint-name,
.endpoint-name-overview {
  overflow: hidden;
  text-overflow: ellipsis;
}

.endpoint-name-overview:hover {
  text-decoration: underline;
}

.path-name {
  font-size: var(--api-navigation-path-label-font-size, 13px);
  color: var(--api-navigation-path-label-color, #616161);
}

*[hidden] {
  display: none !important;
}

.children {
  background-color: inherit;
}

.list-item {
  display: block;
  position: relative;
  min-height: var(--api-navigation-list-item-min-height, 40px);
  padding: var(--api-navigation-list-item-padding, 4px 16px);
  border: none;
  outline: none;
  background-color: inherit;
  width: 100%;
  text-align: left;
  box-sizing: border-box;
  cursor: pointer;
  word-break: var(--api-navigation-list-item-word-break, break-all);
  display: flex;
  flex-direction: row;
  align-items: center;
  /* For Anypoint styles */
  border-left: var(--api-navigation-list-item-border-left);
}

.list-item.selected {
  font-weight: var(--api-navigation-list-item-selected-weight, bold);
  background-color: var(--api-navigation-list-item-selected-background-color, var(--accent-color));
  color: var(--api-navigation-list-item-selected-color, #fff);
  /* For Anypoint styling */
  border-left: var(--api-navigation-list-item-selected-border-left, initial);
}

.list-item.selected .toggle-button .icon,
.list-item.selected .endpoint-toggle-button .icon {
  color: var(--api-navigation-list-item-selected-icon-color, #fff);
}

.list-item.passive-selected {
  font-weight: var(--api-navigation-list-item-selected-weight, bold);
}

.list-item[disabled] {
  color: var(
    --api-navigation-list-item-disabled-color,
    var(--disabled-text-color)
  );
}

.list-item:focus {
  position: relative;
  outline: 0;
}

.list-item:hover:not(.selected) {
  /* This is Anypoint styling requirement */
  border-left: var(--api-navigation-list-item-hovered-border-left, initial);
}

.list-item:focus:before {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: currentColor;
  content: "";
  opacity: var(--dark-divider-opacity);
  pointer-events: none;
}

a.list-item {
  color: inherit;
  text-decoration: none;
}

.toggle-button,
.endpoint-toggle-button {
  transform: rotateZ(0deg);
  transition: transform 0.3s ease-in-out;

  width: var(--api-navigation-endpoint-toggle-icon-width, 32px);
  height: var(--api-navigation-endpoint-toggle-icon-height, 32px);
}

.endpoint-toggle-button {
  transform: rotateZ(0deg);
  transition: transform 0.3s ease-in-out;
  margin-right: var(--api-navigation-endpoint-toggle-icon-margin-right);
}

[data-opened] .toggle-button,
[data-endpoint-opened] .endpoint-toggle-button {
  transform: rotateZ(-180deg);
}

.method-label {
  margin-bottom: 0 !important;
  white-space: nowrap;
}

.list-item.selected .method-label[data-method] {
  color: var(--method-display-selected-color, #fff);
}

.operation {
  padding-left: var(--api-navigation-operation-item-padding-left, 24px);
  font-size: var(--api-navigation-operation-font-size, 14px);
}

[data-endpoint-opened] {
  background-color: var(
    --api-navigation-operation-endpoint-opened-background-color,
    inherit
  );
}

.icon {
  display: block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.new-tab {
  width: 16px;
  height: 16px;
  margin-left: 8px;
  display: inline-block;
  vertical-align: middle;
}

.method-label[data-method="publish"] {
  background-color: var(
    --http-method-label-publish-background-color,
    rgba(31, 157, 85, 0.12)
  );
  color: var(--http-method-label-publish-color, #1f9d55);
}

.method-label[data-method="subscribe"] {
  background-color: var(
    --http-method-label-subscribe-background-color,
    rgba(52, 144, 220, 0.12)
  );
  color: var(--http-method-label-subscribe-color, #3490dc);
}
`;
