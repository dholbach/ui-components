import React from 'react';
import faker from 'faker';
import moment from 'moment';
import { compact, range, times } from 'lodash';

import PrometheusGraph from '.';
import { Example, Info } from '../../utils/example';

function generateRandomMultiSeries({ startTime, endTime, stepDuration }, key, count) {
  return times(count, () => ({
    metric: { [key]: faker.lorem.slug() },
    values: range(startTime, endTime + 1e-6, stepDuration).map(time => (
      [time, faker.random.number({ min: 10, max: 20 })]
    )),
  }));
}

function generateDeployments({ startTime, endTime }, count) {
  return times(count, () => ({
    Stamp: moment.unix(faker.random.number({ min: startTime, max: endTime })),
    Data: compact([
      `Commit: ${faker.lorem.word()}`,
      Math.random() < 0.5 && faker.lorem.slug(),
      Math.random() < 0.5 && faker.lorem.slug(),
      Math.random() < 0.5 && faker.lorem.slug(),
    ]).join(', '),
  }));
}

export default class PrometheusGraphExample extends React.Component {
  constructor() {
    super();

    this.state = {
      startTime: moment('2018-02-05T11:24:14Z').unix(),
      endTime: moment('2018-02-05T11:54:14Z').unix(),
      stepDuration: 9,
      loading: true,
    };

    this.state.multiSeriesJobs = generateRandomMultiSeries(this.state, 'job', 7);
    this.state.multiSeriesServices = generateRandomMultiSeries(this.state, 'namespace', 4);
    this.state.deployments = generateDeployments(this.state, 6);
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({ loading: false });
      setTimeout(() => {
        this.setState({ loading: true });
      }, 2500);
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    return (
      <div>
        <Example>
          <Info>Simple Prometheus graph</Info>
          <PrometheusGraph
            showStacked
            multiSeries={this.state.multiSeriesJobs}
            stepDurationSec={this.state.stepDuration}
            startTimeSec={this.state.startTime}
            endTimeSec={this.state.endTime}
            getSeriesName={({ metric }) => JSON.stringify(metric)}
          />
          <Info>Namespaces with deployments</Info>
          <PrometheusGraph
            showStacked
            multiSeries={this.state.multiSeriesServices}
            stepDurationSec={this.state.stepDuration}
            startTimeSec={this.state.startTime}
            endTimeSec={this.state.endTime}
            deployments={this.state.deployments}
          />
          <Info>Reloading graph</Info>
          <PrometheusGraph
            showStacked
            loading={this.state.loading}
            multiSeries={this.state.multiSeriesServices}
            stepDurationSec={this.state.stepDuration}
            startTimeSec={this.state.startTime}
            endTimeSec={this.state.endTime}
            deployments={this.state.deployments}
          />
          <Info>Error with no data</Info>
          <PrometheusGraph
            showStacked
            multiSeries={[]}
            error="No datapoints found. Maybe the metric does not exist?"
            loading={this.state.loading}
            stepDurationSec={this.state.stepDuration}
            startTimeSec={this.state.startTime}
            endTimeSec={this.state.endTime}
          />
          <Info>Error with data</Info>
          <PrometheusGraph
            showStacked
            multiSeries={this.state.multiSeriesServices}
            error="Hmm... something with the metrics looks wrong"
            loading={this.state.loading}
            stepDurationSec={this.state.stepDuration}
            startTimeSec={this.state.startTime}
            endTimeSec={this.state.endTime}
          />
        </Example>
      </div>
    );
  }
}
