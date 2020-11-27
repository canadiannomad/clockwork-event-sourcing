docker run --rm --privileged docker/binfmt:a7996909642ee92942dcd6cff44b9b95f08dad64 # from https://hub.docker.com/r/docker/binfmt/tags?page=1
docker buildx create --name mybuilder
docker buildx use mybuilder
docker buildx inspect --bootstrap
$(aws ecr get-login --no-include-email --region $AWS_DEFAULT_REGION)
docker buildx build --platform linux/amd64,linux/arm64 -t <awsaccount>.dkr.ecr.us-east-1.amazonaws.com/minevtsrc:latest --push .

