import { Spec } from 'vega';

// https://vega.github.io/editor/#/examples/vega/bar-chart
export const spec: Spec = {
  "$schema": "https://vega.github.io/schema/vega/v4.json",
  "width": 500,
  "height": 100,
  "padding": 5,

  "signals": [
    { "name": "bandwidth", "value": 0,
      "bind": {"input": "range", "min": 0, "max": 0.1, "step": 0.001} },
    { "name": "steps", "value": 100,
      "bind": {"input": "range", "min": 10, "max": 500, "step": 1} },
    { "name": "method", "value": "pdf",
      "bind": {"input": "radio", "options": ["pdf", "cdf"]} },
    { "name": "summary",
      "update": "data('summary')[0] || {mean: 0, stdev: 0}" }
  ],

  "data": [
    {
      "name": "points",
      "url": "data/normal-2d.json"
    },
    {
      "name": "summary",
      "source": "points",
      "transform": [
        {
          "type": "aggregate",
          "fields": ["u", "u"],
          "ops": ["mean", "stdev"],
          "as": ["mean", "stdev"]
        }
      ]
    },
    {
      "name": "density",
      "source": "points",
      "transform": [
        {
          "type": "density",
          "extent": {"signal": "domain('xscale')"},
          "steps": {"signal": "steps"},
          "method": {"signal": "method"},
          "distribution": {
            "function": "kde",
            "field": "u",
            "bandwidth": {"signal": "bandwidth"}
          }
        }
      ]
    },
    {
      "name": "normal",
      "transform": [
        {
          "type": "density",
          "extent": {"signal": "domain('xscale')"},
          "steps": {"signal": "steps"},
          "method": {"signal": "method"},
          "distribution": {
            "function": "normal",
            "mean": {"signal": "summary.mean"},
            "stdev": {"signal": "summary.stdev"}
          }
        }
      ]
    }
  ],

  "scales": [
    {
      "name": "xscale",
      "type": "linear",
      "range": "width",
      "domain": {"data": "points", "field": "u"},
      "nice": true
    },
    {
      "name": "yscale",
      "type": "linear",
      "range": "height", "round": true,
      "domain": {
        "fields": [
          {"data": "density", "field": "density"},
          {"data": "normal", "field": "density"}
        ]
      }
    },
    {
      "name": "color",
      "type": "ordinal",
      "domain": ["Normal Estimate", "Kernel Density Estimate"],
      "range": ["#444", "steelblue"]
    }
  ],

  "axes": [
    {"orient": "bottom", "scale": "xscale", "zindex": 1}
  ],

  "legends": [
    {"orient": "top-left", "fill": "color", "offset": 0, "zindex": 1}
  ],

  "marks": [
    {
      "type": "area",
      "from": {"data": "density"},
      "encode": {
        "update": {
          "x": {"scale": "xscale", "field": "value"},
          "y": {"scale": "yscale", "field": "density"},
          "y2": {"scale": "yscale", "value": 0},
          "fill": {"signal": "scale('color', 'Kernel Density Estimate')"}
        }
      }
    },
    {
      "type": "line",
      "from": {"data": "normal"},
      "encode": {
        "update": {
          "x": {"scale": "xscale", "field": "value"},
          "y": {"scale": "yscale", "field": "density"},
          "stroke": {"signal": "scale('color', 'Normal Estimate')"},
          "strokeWidth": {"value": 2}
        }
      }
    },
    {
      "type": "rect",
      "from": {"data": "points"},
      "encode": {
        "enter": {
          "x": {"scale": "xscale", "field": "u"},
          "width": {"value": 1},
          "y": {"value": 25, "offset": {"signal": "height"}},
          "height": {"value": 5},
          "fill": {"value": "steelblue"},
          "fillOpacity": {"value": 0.4}
        }
      }
    }
  ]
};
