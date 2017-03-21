
upgrade () {
  tag=$1
  echo "Upgrading to $tag"
  git checkout $tag
  # @todo start.sh needs to only exit when container is actually ready.
  ./start.sh
  docker exec -it tangerine-container /tangerine-server/upgrades/$tag.sh
}

git describe --tags --from=`git describe --current-tag` | xargs -I {} upgrade {}

