{{/* Compile a version string */}}
{{- define "chart.version" -}}
{{ printf "%s-%s" .Chart.Name (.Chart.Version | replace "+" "_") }}
{{- end -}}

{{/* Compile an image string */}}
{{- define "deployment.image" -}}
{{ printf "%s:%s" .Values.image.repository (.Values.image.tag | default "latest") }}
{{- end -}}

{{/* Compile a resources' names (such as deployments, services, ingresses etc) */}}
{{- define "deployment.name" -}}
{{- if .Values.fullnameOverride -}}
{{- print .Values.nameOverride -}}
{{- else -}}
{{- if .Values.commitHash -}}
{{- printf "%s-%s-%s" .Values.commitHash .Chart.Name .Release.Name -}}
{{- else -}}
{{- printf "%s-%s" .Chart.Name .Release.Name -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "labels.deployment" -}}
app.kubernetes.io/name: {{ template "deployment.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "labels.common" -}}
{{ include "labels.deployment" . }}
app.kubernetes.io/version: {{ .Values.image.tag | default .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ template "chart.version" . }}
{{- end -}}
