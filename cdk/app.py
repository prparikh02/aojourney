#!/usr/bin/env python3

from aws_cdk import core

from cdk.cdk_stack import AOJourneyStack


app = core.App()
AOJourneyStack(app, "AOJourneyStack-v001")

app.synth()
