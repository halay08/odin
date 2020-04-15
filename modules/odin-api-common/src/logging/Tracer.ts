/**
 * Jaeger tracing client.
 */
import * as dotenv from 'dotenv';
import * as jaeger from 'jaeger-client';
import * as opentracing from 'opentracing';

dotenv.config();

const initTracer = (serviceName: string) => {
    return jaeger.initTracer({
        serviceName: serviceName,
        sampler: {
            type: 'const',
            param: 1,
        },
        reporter: {
            logSpans: false, // this logs whenever we send a span
            collectorEndpoint: process.env.JAEGER_ENDPOINT,
        },
    });
};

export const tracer = initTracer(process.env.JAEGER_SERVICE_NAME || 'MISSING_JAEGER_SERVICE_NAME') as opentracing.Tracer;
