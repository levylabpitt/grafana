import React from 'react';

import { SelectableValue } from '@grafana/data';
import { Input, Select, Switch } from '@grafana/ui';

import { OptionsPaneCategoryDescriptor } from './OptionsPaneCategoryDescriptor';
import { OptionsPaneItemDescriptor } from './OptionsPaneItemDescriptor';
import { OptionPaneRenderProps } from './types';

export function getTimeBucketOptions(props: OptionPaneRenderProps): OptionsPaneCategoryDescriptor {
  const { panel, onPanelConfigChange } = props;
  const descriptor = new OptionsPaneCategoryDescriptor({
    title: 'Time bucket options',
    id: 'Time bucket options',
    isOpenDefault: true,
  });

  const units: Array<SelectableValue<'s' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y'>> = [
    { label: 'Seconds', value: 's' },
    { label: 'Minutes', value: 'm' },
    { label: 'Hours', value: 'h' },
    { label: 'Days', value: 'd' },
    { label: 'Weeks', value: 'w' },
    { label: 'Months', value: 'M' },
    { label: 'Years', value: 'y' },
  ];

  return descriptor
    .addItem(
      new OptionsPaneItemDescriptor({
        title: 'Enabled',
        value: panel.timeBucket?.enabled,
        render: function renderTimeBucketEnabled() {
          return (
            <Switch
              id="enable-time-buckets"
              value={panel.timeBucket?.enabled}
              onChange={(e) =>
                onPanelConfigChange('timeBucket', { ...panel.timeBucket, enabled: e.currentTarget.checked })
              }
            />
          );
        },
      })
    )
    .addItem(
      new OptionsPaneItemDescriptor({
        title: 'Automated',
        value: panel.timeBucket?.automated,
        render: function renderTimeBucketAutomated() {
          return (
            <Switch
              id="automated-time-buckets"
              value={panel.timeBucket?.automated}
              disabled={!panel.timeBucket?.enabled}
              onChange={(e) =>
                onPanelConfigChange('timeBucket', { ...panel.timeBucket, automated: e.currentTarget.checked })
              }
            />
          );
        },
      })
    )
    .addItem(
      new OptionsPaneItemDescriptor({
        title: 'Width',
        value: panel.timeBucket?.width,
        render: function renderTimeBucketWidth() {
          return (
            <Input
              type="number"
              id="TimeBucketWidth"
              defaultValue={5}
              disabled={!panel.timeBucket?.enabled || panel.timeBucket?.automated}
              onBlur={(e) => onPanelConfigChange('timeBucket', { ...panel.timeBucket, width: e.currentTarget.value })}
            />
          );
        },
      })
    )
    .addItem(
      new OptionsPaneItemDescriptor({
        title: 'Unit',
        value: panel.timeBucket?.unit,
        render: function renderTimeBucketUnit() {
          return (
            <Select
              value={panel.timeBucket?.unit}
              options={units}
              defaultValue={'m'}
              disabled={!panel.timeBucket?.enabled || panel.timeBucket?.automated}
              onChange={(e: SelectableValue) =>
                onPanelConfigChange('timeBucket', { ...panel.timeBucket, unit: e.value })
              }
            />
          );
        },
      })
    );
}
