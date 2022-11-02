import { css } from 'lit';

export default css`
:host {
  display: block;
  background-color: var(--api-navigation-background-color, inherit);
  color: var(--api-navigation-color, inherit);
  overflow: auto;
  position: relative;
  outline: none;
}

.wrapper {
  color: inherit;
}

*[hidden] {
  display: none !important;
}

.section-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: default;
  padding: var(--api-navigation-section-title-padding, 4px 16px);
  background-color: var(--api-navigation-section-title-background-color, inherit);
  user-select: none;
  min-height: 40px;
  color: var(--api-navigation-header-color, inherit);
  outline: none;
}

.section-title:focus {
  background-color: var(--api-navigation-section-title-focus-background-color, #e5e5e5);
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
  font-weight: var(--api-navigation-endpoint-font-weight, 400);
  font-size: var(--api-navigation-endpoint-font-size, 15px);
  user-select: none;
  display: flex;
  flex-direction: row;
}

.list-item.endpoint:first-of-type {
  margin-top: 0px;
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

.list-item.passive-selected {
  font-weight: var(--api-navigation-list-item-selected-weight, bold);
}

.list-item[disabled] {
  color: var(--api-navigation-list-item-disabled-color, var(--disabled-text-color));
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
  content: '';
  opacity: var(--dark-divider-opacity);
  pointer-events: none;
}

a.list-item {
  color: inherit;
  text-decoration: none;
}

.toggle-button.section {
  transform: rotateZ(0deg);
  transition: transform 0.3s ease-in-out;

  width: var(--api-navigation-section-toggle-icon-width, 32px);
  height: var(--api-navigation-section-toggle-icon-height, 32px);
}

.toggle-button.section arc-icon {
  color: var(--api-navigation-section-toggle-icon-color, var(--accent-color));
}

section.opened .toggle-button.section {
  transform: rotateZ(-180deg);
}

.toggle-button.endpoint {
  transform: rotateZ(-90deg);
  transition: transform 0.3s ease-in-out;
}

.toggle-button.endpoint arc-icon {
  color: var(--primary-text-color);
}

.endpoint.opened .toggle-button.endpoint {
  transform: rotateZ(0deg);
}

.endpoint-toggle-mock {
  width: 18px;
  height: 40px;
}

.list-item .method-label {
  margin: 0 8px 0 0;
}

.schemas .list-item,
.documentation .list-item,
.security .list-item,
.custom-properties .list-item {
  padding-left: var(--api-navigation-list-item-padded-padding, 24px);
}

.filter-wrapper {
  padding: 0 12px;
  height: 40px;
  margin-bottom: 20px;
  margin-top: 8px;
  background-color: var(--api-navigation-filter-input-background-color, #e6e6e6);
  border-radius: var(--api-navigation-filter-input-border-radius, 16px);
  display: flex;
  align-items: center;
}

.filter-wrapper:focus-within {
  background-color: var(--api-navigation-filter-input-focused-background-color, #f1f1f1);
}

.filter-wrapper input::placeholder {
  color: currentColor;
  opacity: 1;
  font-size: var(--api-navigation-filter-input-placeholder-font-size, 14px);
}

.filter-wrapper input{
  border: none;
  align-self: stretch;
  flex: 1;
  background-color: transparent;
  outline: none;
}

.input-item {
  padding: 0 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 40px;
  background-color: var(--api-navigation-edit-input-background-color, #e6e6e6);
  border-radius: var(--api-navigation-edit-input-border-radius, 16px);
}

.input-item input {
  margin: 0;
  padding: 0;
  border: none;
  width: 100%;
  outline: none;
  background: transparent;
}

.rename {
  width: 100%;
  padding: 4px 2px;
  font-size: 1rem;
  border: none;
  background-color: var(--api-navigation-rename-input-background-color, initial);
  color: var(--api-navigation-rename-input-color, initial);
}

.input-item.add-external-doc-input {
  margin-bottom: 8px;
}

.new-tab {
  margin-left: 8px;
  width: 20px;
  height: 20px;
  color: var(--api-navigation-new-tab-icon-color, #434343);
}

.empty-section {
  padding-left: 16px;
}
`;
