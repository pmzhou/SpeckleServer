'use strict'
const winston           = require( 'winston' )
const chalk             = require( 'chalk' )

const DataStream        = require( '../../../../models/DataStream' )
const MergeLayers       = require( '../../helpers/MergeLayers' )

module.exports = ( req, res ) => {
  if( !req.params.streamId ) {
    res.status( 400 ) 
    return res.send( { success:false, message: 'No stream id provided.' } )
  }
  if( !req.body.layers ) {
    res.status( 400 ) 
    return res.send( { success:false, message: 'No layers provided.' } )
  }

  DataStream.findOne( { streamId: req.params.streamId } )
  .then( stream => {
    if( !stream ) throw new Error( 'No stream found.' )
    if( stream.private && !req.user ) throw new Error( 'Unauthorized. Please log in.' ) 
    if( stream.private && ( !req.user ||  !( req.user._id.equals( stream.owner ) || stream.sharedWith.find( id => { return req.user._id.equals( id ) } ) ) ) ) 
      throw new Error( 'Unauthorized. Please log in.' )  

    stream.layers = req.body.layers
    stream.markModified('layers')
    return stream.save()
  })
  .then( stream => {
    res.status( 200 ) 
    return res.send( { success: true, message: 'Stream layers were replaced.' } )
  })
  .catch( err => {
    winston.error( err )
    res.status( 400 )
    res.send( { success: false, message: err.toString() } )
  })  
}